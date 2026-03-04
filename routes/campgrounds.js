const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgroundControllers = require('../controllers/campgrounds');
const { storage } = require('../cloudinary')
const multer = require('multer');

const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(campgroundControllers.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgroundControllers.create))

router.get('/', wrapAsync(campgroundControllers.index))

router.get('/new', isLoggedIn, campgroundControllers.newForm)

router.route('/:id')
    .get(wrapAsync(campgroundControllers.show))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, wrapAsync(campgroundControllers.put))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgroundControllers.remove))

// error handling for invalid/short ID produces the same results in the above and below app.get handlers.

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgroundControllers.editForm))

module.exports = router;