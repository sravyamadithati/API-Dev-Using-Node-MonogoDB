const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
//const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');
const bookingRouter = require('./bookingRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/bookings', bookingRouter);

//router.param('id', tourController.checkId); //if url contains id params ,then this middleware will run

router
   .route('/tours-within/:distance/center/:latlng/unit/:unit')
   .get(tourController.getToursWithin);

router
   .route('/distances/:latlng/unit/:unit')
   .get(tourController.getTourDistances);

router.route('/tour-stats').get(tourController.getTourStats);
router
   .route('/monthly-plan/:year')
   .get(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide', 'guide'),
      tourController.getMonthlyPlan
   );

router
   .route('/')
   .get(tourController.getAllTours)
   .post(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.createTour
   );

router
   .route('/:id')
   .get(tourController.getTour)
   .patch(
      authController.protect,
      authController.restrictTo('admin', 'lead-guide'),
      tourController.uploadTourPhotos,
      tourController.resizeTourPhotos,
      tourController.updateTour
   )
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
