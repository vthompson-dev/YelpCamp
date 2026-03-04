const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const maptilerClient = require('@maptiler/client');

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds, maptilerApiKey: process.env.MAPTILER_API_KEY });
}

const newForm = (req, res) => {
    res.render('campgrounds/new');
}

const create = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.images = req.files.map(f => ({ url: f.secure_url, filename: f.public_id }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

const show = async (req, res, next) => {
    const { id } = req.params;
    if (id.length === 24) {
        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        if (!campground) {
            req.flash('error', 'Campground not found.');
            return res.redirect('/campgrounds');
        }
        console.log(campground.images);
        res.render('campgrounds/show', { campground, maptilerApiKey: process.env.MAPTILER_API_KEY })
    } else {
        throw new ExpressError('Campground Not Found', 404)
    }
}

const editForm = async (req, res, next) => {
    const { id } = req.params;
    if (id.length !== 24) {
        throw new ExpressError('Campground Not Found', 404)
    }
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

const put = async (req, res, next) => {
    const { id } = req.params;
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    const imgs = req.files.map(f => ({ url: f.secure_url, filename: f.public_id }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground details!');
    res.redirect(`/campgrounds/${campground._id}`);
}

const remove = async (req, res) => {
    const { id } = req.params;
    if (id.length === 24) {
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted the campground!');
        res.redirect('/campgrounds');
    }
    else {
        throw new ExpressError('Campground not found', 404);
    }
}

module.exports = { index, newForm, create, show, editForm, put, remove }