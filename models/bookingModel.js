const mongoose = require('mongoose');
//const Tour = require('./tourModel');
//const User=require('./userModel')

const bookingSchema = new mongoose.Schema({
   tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Booking must belong to a tour'],
      ref: 'Tour',
   },
   user: {
      type: mongoose.Schema.ObjectId,
      reuired: [true, 'Booking must belong to a user'],
      ref: 'User',
   },
   price: {
      type: Number,
      required: [true, 'Booking must have a price'],
   },
   createdAt: {
      type: Date,
      default: Date.now(),
   },
   paid: {
      type: Boolean,
      default: true,
   },
});

bookingSchema.pre('/^find', function (next) {
   this.populate('user').populate({
      path: 'tour',
      select: 'name',
   });
   next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
