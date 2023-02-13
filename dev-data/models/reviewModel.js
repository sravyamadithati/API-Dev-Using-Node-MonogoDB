const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
   {
      review: {
         type: String,
         required: [true, 'Review can not be empty'],
      },
      rating: {
         max: 5,
         min: 1,
         type: Number,
      },
      createdAt: {
         type: Date,
         default: Date.now(),
      },
      tour: {
         type: mongoose.Schema.ObjectId,
         ref: 'Tour',
         required: [true, 'Review must belong to a tour'],
      },
      user: {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
         required: [true, 'Review must belong to a user'],
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

reviewSchema.pre(/^find/, function (next) {
   // this.populate({ path: 'tour', select: 'name' })
   //    //eventhough we have included only name in select option,we will also get guides array when we try to find reviews.This is happening
   //    //because of tourSchema.Cause the populate method internally makes a call to another query.Since find(document middleware pre)
   //    //is fetching guides.We are also seeing guides when we fetch reviews //we can use " select:'-guides name' " to prevent guides from adding
   //    .populate({
   //       path: 'user',
   //       select: 'name photo',
   //    });
   this.populate({
      path: 'user',
      select: 'name photo',
   });
   next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
