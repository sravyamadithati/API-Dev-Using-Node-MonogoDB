const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
//prevents duplicate reviews.The combination of tour and user will always be unique by implementing this
//avoids a single user to create multiple reviews on same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
   const stats = await this.aggregate([
      {
         $match: { tour: tourId },
      },
      {
         $group: {
            _id: '$tour',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' },
         },
      },
   ]);
   if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: stats[0].avgRating,
         ratingsQuantity: stats[0].nRating,
      });
   } else {
      await Tour.findByIdAndUpdate(tourId, {
         ratingsAverage: 4.5,
         ratingsQuantity: 0,
      });
   }
};

//findByIdAndUpdate
//findByIdAndDelete
//We need to update ratings quantity and avg,everytime user updates or deletes a review
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
   //doc refers to returned if user performs findByIdAndUpdate or findByIdAndDelete
   if (doc) {
      await doc.constructor.calcAverageRatings(doc.tour);
   }
});

//we are calculating statistics only after the review is stored to db,so that all the reviews will be available when we query to db
reviewSchema.post('save', function () {
   //this points to current review. this.tour gives tour field available on the review
   //this.constructor points to model
   //   mongoose.model('Review').calcAverageRatings(this.tour)---->this would also work
   this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
