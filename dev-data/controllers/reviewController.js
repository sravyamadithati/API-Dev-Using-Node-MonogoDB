const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utils/apiError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
   let filter = {};
   if (req.params.tourId) {
      filter = { tour: req.params.tourId };
   }
   const reviews = await Review.find(filter);
   res.status(200).json({
      data: {
         reviews,
      },
      results: reviews.length,
      status: 'success',
   });
});

exports.getReview = catchAsync(async (req, res, next) => {
   const review = await Review.findById(req.params.id);
   if (!review) {
      next(new AppError('No Review found with that ID', 404));
   }
   res.status(200).json({
      result: review.length,
      data: {
         review,
      },
      status: 'success',
   });
});

exports.createReview = catchAsync(async (req, res, next) => {
   if (!req.body.tour) {
      req.body.tour = req.params.tourId;
   }
   if (!req.body.user) {
      req.body.user = req.user;
   }
   const review = await Review.create(req.body);
   res.status(201).json({
      data: {
         review,
      },
      status: 'success',
   });
});

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);
