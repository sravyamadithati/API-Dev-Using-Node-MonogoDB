const Stripe = require('stripe');
const Tour = require('../models/tourModel.js');
const Booking = require('../models/bookingModel.js');
const AppError = require('../utils/apiError.js');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory.js');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   //1)Get currently booked tour
   const tour = await Tour.findById(req.params.tourId);
   //2)Create checkout session
   const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
         req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`, //once payment is successful,user will be redirected to home page
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //if user clicks cancel btn,then he will be redirected to tour page
      client_reference_id: req.params.tourId,
      customer_email: req.user.email,
      mode: 'payment',
      line_items: [
         {
            quantity: 1,
            price_data: {
               currency: 'inr',
               unit_amount: tour.price * 100, //converting tour price to cents
               product_data: {
                  name: `${tour.name} Tour`,
                  description: tour.summary,
                  images: [
                     `https://www.natours.dev/img/tours/${tour.imageCover}`,
                  ],
               },
            },
         },
      ],
   });
   //3)Create session as response
   res.status(200).json({
      status: 'success',
      session,
   });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
   //this is temporary cause its unsecure,anyone can make bookings without paying
   const { tour, price, user } = req.query;
   if (!tour || !price || !user) return next();
   await Booking.create({ tour, price, user });
   res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
