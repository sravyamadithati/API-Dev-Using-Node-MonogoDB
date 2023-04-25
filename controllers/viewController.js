const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res) => {
   const tours = await Tour.find();
   res.status(200).render('overview', {
      title: 'All tours',
      tours,
   });
});

exports.getTour = catchAsync(async (req, res) => {
   //1.get the data for the requested tour(including review and guides)
   const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
   });
   //2.build template
   //3.Render template using data from 1
   res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
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
