const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviews')
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

router.post('/', validateReview, isLoggedIn, wrapAsync(reviewController.create))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroy))

module.exports = router;