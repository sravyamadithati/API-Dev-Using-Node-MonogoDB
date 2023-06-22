const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
   .route('/')
   .get(reviewController.getAllReviews)
   .post(
      authController.restrictTo('user'),
      reviewController.setTourUserIds,
      reviewController.checkIfTourIsBookedByUser,
      reviewController.createReview
   );
//we are allowing only roles with 'user' to add a review.So that we can avoid guides and adminstartors to add a review

router
   .route('/:id')
   .get(reviewController.getReview)
   .patch(
      authController.protect,
      authController.restrictTo('user', 'admin'),
      reviewController.updateReview
   )
   .delete(
      authController.restrictTo('user', 'admin'),
      reviewController.deleteReview
   );

module.exports = router;
