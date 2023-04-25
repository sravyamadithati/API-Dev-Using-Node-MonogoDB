const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'A tour must have a name'],
         unique: true,
         //select: false,
         trim: true,
         maxLength: [40, 'A tour must have less or equal than 40 characters'],
         minLength: [10, 'A tour must have less or equal than 10 characters'],
         //validate:[validator.isAlpha,'Tour name must only contain characters']  //here,validator is third part library installed from npm
      },
      slug: String,
      duration: {
         type: Number,
         required: [true, 'A tour must have a duration'],
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'A tour must have a group size'],
      },
      difficulty: {
         type: String,
         required: [true, 'A tour must have a difficulty'],
         enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult',
         },
      },
      ratingsAverage: {
         type: Number,
         default: 4.5,
         min: [1, 'Rating must be above 1.0'],
         max: [5, 'Rating must be below 5.0'],
         set: (value) => {
            return Math.round(10 * value) / 10;
            //return value.toFixed(1);
         },
         //Eg: will round 4.666666 to 4.7
      },
      ratingsQuantity: {
         type: Number,
         default: 0,
      },
      price: {
         type: Number,
         required: true,
      },
      priceDiscount: {
         type: Number,
         validate: {
            message: 'Price discount ({VALUE}) must be less than price',
            //custom validators
            validator: function (val) {
               return val < this.price; //this points to current document when we create new document(for updation it doesnt work)
            },
         },
      },
      summary: {
         type: String,
         trim: true, //removes whitespaces around the string
         required: [true, 'A tour must have summary'],
      },
      description: {
         type: String,
         trim: true,
      },
      imageCover: {
         type: String,
         required: [true, 'A tour must have a cover image'],
      },
      images: [String], //array of strings
      createdAt: {
         type: Date,
         default: () => Date.now(), //gives current timestamp in milli sc
      },
      startDates: [Date],
      startLocation: {
         type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
         },
         coordinates: [Number],
         address: String,
         description: String,
      },
      locations: [
         {
            type: {
               type: String,
               default: 'Point',
               enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
         },
      ],
      //guides: Array,
      guides: [
         {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
         },
      ],
   },
   {
      toJSON: { virtuals: true }, //each time the data gets outputted,we want virtuals to present in json response
      toObject: { virtuals: true }, //each time the data gets outputted,we want virtuals to present in object response
   }
);

//document middleware:runs before .save() and .create()
tourSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

tourSchema.virtual('durationWeeks').get(function () {
   return this.duration / 7;
});

tourSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'tour',
   localField: '_id',
});

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
   });
   next();
});
//For embedding guides documents
//document middleware runs before .save() or .create()
// tourSchema.pre('save', async function (next) {
//    const guidePromises = this.guides.map(async (id) => await User.findById(id));
//    this.guides = await Promise.all(guidePromises);
//    next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

//Creating a document
//const tourData = new Tour({
//    name: 'Tourrr',
//    price: '2000',
// });
// tourData
//    .save() //saves the data to db and returns a promise
//    .then((doc) => {
//       console.log(doc);
//    })
//    .catch((err) => {
//       console.log(err);
//    });
