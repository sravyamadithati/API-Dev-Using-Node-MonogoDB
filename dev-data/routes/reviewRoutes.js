const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
   .route('/')
   .get(
      authController.protect,
      authController.restrictTo('user'),
      reviewController.getAllReviews
   )
   .post(
      authController.protect,
      authController.restrictTo('user'),
      reviewController.createReview
   );
//we are allowing only roles with 'user' to add a review.So that we can avoid guides and adminstartors to add a review

router
   .route('/:id')
   .get(authController.protect, reviewController.getReview)
   .patch(authController.protect, reviewController.updateReview)
   .delete(reviewController.deleteReview);

module.exports = router;
