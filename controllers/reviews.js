const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

const create = async (req, res) => {
    const { id } = req.params;
    if (id.length === 24) {
        const campground = await Campground.findById(id);
        if (!campground) {
            throw new ExpressError('Campground Not Found', 404);
        }
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        console.log(review);
        req.flash('success', 'Successfully posted a new review!');
        res.redirect(`/campgrounds/${campground._id}`);
    } else {
        throw new ExpressError('Campground Not Found', 404)
    }
}

const destroy = async (req, res) => {
    const { id, reviewId } = req.params;
    if (id.length === 24) {
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId)
        req.flash('success', 'Successfully deleted the review!');
        res.redirect(`/campgrounds/${id}`);
    }
    else {
        throw new ExpressError('Campground not found', 404);
    }
}

module.exports = { create, destroy }