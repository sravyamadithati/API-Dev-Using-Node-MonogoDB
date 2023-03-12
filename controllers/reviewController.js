const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const AppError = require('../utils/apiError');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
   console.log(req.user);
   if (!req.body.tour) {
      req.body.tour = req.params.tourId;
   }
   req.body.user = req.user.id;
   next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);