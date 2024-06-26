const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res) => {
   const tours = await Tour.find();
   res.status(200).render('overview', {
      title: 'All tours',
      tours,
   });
});

exports.getTour = catchAsync(async (req, res, next) => {
   //1.get the data for the requested tour(including review and guides)
   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
   });

   if (!tour) {
      return next(new AppError('There is no tour with that Id', 404));
   }
   //2.build template
   //3.Render template using data from 1
   res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
   });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
   const bookings = await Booking.find({ user: req.user.id });
   const tourIds = bookings.map((el) => el.tour);
   const tours = await Tour.find({ _id: { $in: tourIds } });
   res.status(200).render('overview', {
      title: 'My tours',
      tours,
   });
});

exports.getLoginForm = async (req, res) => {
   res.status(200)
      .set(
         'Content-Security-Policy',
         "connect-src 'self' https://cdnjs.cloudflare.com"
      )
      .render('login', {
         title: 'Log into your account',
      });
};

exports.getAccount = (req, res) => {
   res.status(200).render('account', {
      title: 'Your Account',
   });
};

exports.updateUserData = catchAsync(async (req, res) => {
   const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
         name: req.body.name,
         email: req.body.email,
      },
      {
         new: true,
         runValidators: true,
      }
   );

   res.status(200).render('account', {
      title: 'Your Account',
      user: updatedUser,
   });
});
