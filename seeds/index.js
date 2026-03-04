const mongoose = require('mongoose');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities');
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
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

const randomIndex = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${randomIndex(descriptors)} ${randomIndex(places)}`,
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus ex reprehenderit consectetur consequatur quaerat, illum ea nihil numquam earum deserunt hic nostrum eaque, totam ullam eligendi voluptate iure quam tempore!',
            price: `${price}`,
            author: '698b9c73925333bd3168baf0',
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/drs623csl/image/upload/v1771536623/YelpCamp/yeqwnvpgt9ovaguxhvdj.png',
                    filename: 'YelpCamp/yeqwnvpgt9ovaguxhvdj'
                },
                {
                    url: 'https://res.cloudinary.com/drs623csl/image/upload/v1771536624/YelpCamp/cjwbjiaqgjyt7eul55ht.png',
                    filename: 'YelpCamp/cjwbjiaqgjyt7eul55ht'
                }

            ]
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});