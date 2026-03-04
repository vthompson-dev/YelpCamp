const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: {
        type: String,
        required: [true, 'You must include review content.']
    },
    rating: {
        type: Number,
        required: [true, 'You must provide a rating']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;