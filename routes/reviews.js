// Clean up our routes using express Router
const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { validateReviews, isLoggedIn, verifyReviewAuthor } = require('../middleware');

// Add new reviews

router.post('/', isLoggedIn, validateReviews, catchAsync(reviews.addReview));

// Delete a review:

router.delete('/:reviewId', isLoggedIn, verifyReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
