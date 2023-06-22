const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/apiError');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
   if (!req.body.tour) {
      req.body.tour = req.params.tourId;
   }
   req.body.user = req.user.id;
   next();
};
//this functions allows users to add reviews only if they have booked the tour
exports.checkIfTourIsBookedByUser = async (req, res, next) => {
   const data = await Booking.findOne({
      tour: req.body.tour,
      user: req.body.user,
   });
   //console.log('book', data);
   if (!data) {
      return next(new AppError('You must buy this tour to review it', 401));
   }
   next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
