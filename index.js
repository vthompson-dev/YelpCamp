const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
app.set('query parser', 'extended');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const wrapAsync = require('./utils/wrapAsync');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL;
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongo Connection Successful')
    })
    .catch(error => {
        console.log("Mongo connection error")
        console.log(error)
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("Session Store Error", e)
});

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 3600 * 24 * 7,
        maxAge: 1000 * 3600 * 24 * 7,
        httpOnly: true
    }

}
app.use(session(sessionConfig));

app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
    "https://cdn.jsdelivr.net"
];
const fontSrcUrls = [];
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'unsafe-inline'", "'self'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/drs623csl/",
                    "https://images.unsplash.com/",
                    "https://api.maptiler.com/"
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        },
    }),
);


app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));

app.use(morgan('tiny'));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'test@gmail.com', username: 'testuser' });
//     const newUser = await User.register(user, 'testpass');
//     res.send(newUser);
// })

// app.use((req, res, next) => {
//     console.log(req.method.toUpperCase(), req.path, Date.now());
//     next();
// });

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// Base route

app.get('/', (req, res) => {
    res.render('home')
})

// Campground routes

app.use('/campgrounds', campgroundRoutes);

// Campground review routes

app.use('/campgrounds/:id/reviews', reviewRoutes);

//User routes

app.use('/', userRoutes);

// error routing

app.get('/error', (req, res) => {
    throw new Error('This is the error page')
})
const verifyPass = (req, res, next) => {
    const { password } = req.query;
    if (password === 'zeltspass') {
        next();
    } else {
        throw new ExpressError('Unauthorized; Password Required', 401);
    }
};

app.get('/admin', (req, res) => {
    throw new ExpressError('You are not an admin', 403);
})


app.get('/secret', verifyPass, (req, res) => {
    res.send("There is no secret ingredient.")
})

// app.use((req, res, next) => {
//     res.status(404).send('Path not found.')
// })

// app.use(function (err, req, res, next) {
//     console.log('***Error Error Error Error***')
//     res.status(500).send("You've come across an error!")
//     next(err);
// })

const handleValidationError = err => {
    console.dir(err);
    return new ExpressError(`Validation Failed...${err.message}`, 400);
}

app.use(function (err, req, res, next) {
    console.log(err.name);
    if (err.name === 'ValidationError') {
        err = handleValidationError(err);
    }
    next(err);
})

// app.all(/(.*)/, (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404))
// })

app.use(function (err, req, res, next) {
    const { status = 500 } = err;
    if (!err.message) {
        err.message = "Something Went Wrong"
    }
    res.status(status).render('error', { err })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// app.listen(3000, () => {
//     console.log("App is listening on port 3000")
// })

module.exports = app;