const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
//const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

//router.param('id', tourController.checkId); //if url contains id params ,then this middleware will run
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
   .route('/')
   .get(authController.protect, tourController.getAllTours)
   .post(tourController.createTour);

router
   .route('/:id')
   .get(tourController.getTour)
   .patch(tourController.updateTour)
   .delete(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'), //passing rest parameters to restrictTo functions
      tourController.deleteTour
   );

// router
//    .route('/:tourId/reviews') //accesing review on a particular tour
//    .post(
//       authController.protect,
//       authController.restrictTo('user'),
//       reviewController.createReview
//    );

module.exports = router;
