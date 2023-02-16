const { deleteOne } = require('../models/tourModel.js');
const Tour = require('../models/tourModel.js');
const AppError = require('../utils/apiError.js');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getTourStats = catchAsync(async (req, res, next) => {
   const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
         $group: {
            _id: { $toUpper: '$difficulty' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
         },
      },
      { $sort: { avgPrice: 1 } },
      // { $match: { _id: { $ne: 'EASY' } } },->we can also repeat stages in this way
   ]);
   res.status(200).json({
      status: 'success',
      data: {
         stats,
      },
   });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getAllTours = factory.getAll(Tour);

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   const year = req.params.year * 1;
   const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
         $match: {
            startDates: {
               $gte: new Date(`${year}-01-01`),
               $lte: new Date(`${year}-12-31`),
            },
         },
      },
      {
         $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' },
         },
      },
      {
         $addFields: { month: '$_id' },
      },
      {
         $project: { _id: 0 },
      },
      {
         $sort: { numTourStats: -1 },
      },
      {
         $limit: 12,
      },
   ]);
   res.status(200).json({
      status: 'success',
      data: {
         plan,
      },
   });
});

// exports.updateTour = catchAsync(async (req, res, next) => {
//    // const id = req.params.id * 1;
//    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, //returns newly updated document
//       runValidators: true, //runs all validators when doc is updated like checking minlength,maxlength again while updating document
//    });
//    if (!tour) {
//       return next(new AppError('No tour found with that ID', 404));
//    }
//    res.status(200).json({
//       status: 'success',
//       data: {
//          tour,
//       },
//    });
// });

// const tours = JSON.parse(
//    fs.readzFileSync(require('path').resolve('dev-data/data/tours-simple.json'))
//    //fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkBody = (req, res, next) => {
//    if (!req.body.name || !req.body.price) {
//       return res.status(400).json({ message: 'No body' });
//    }
//    next();
// };

// exports.checkId = (req, res, next, id) => {
//    // const tour = tours.find((el) => el.id === id * 1);
//    // if (!tour) {
//    //    return res.status(400).json({
//    //       status: 'fail',
//    //       message: 'Invalid Id',
//    //    });
//    // }
//    next();
// };

// exports.getAllTours = catchAsync(async (req, res, next) => {
//    //try {
//    // //******1.Build query

//    // //1AFiltering
//    // const queryObj = { ...req.query };
//    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
//    // //remove above fields if present in query object
//    // excludeFields.forEach((item) => delete queryObj[item]); //or we can use this one:const { page, sort, limit, fields, ...queryObj } = req.query;
//    // //const tours = await Tour.find(queryObj);

//    // /*1B Advanced filtering */
//    // let queryStr = JSON.stringify(queryObj);
//    // queryStr = queryStr.replace(
//    //    /\b(gt|gte|le|lte)\b/g,
//    //    (match) => `$${match}`
//    // ); //we are replacing ge,gte,le,lte(comes from url) with $ge,$gte,$le,$lte(to query using mongoose)
//    // console.log(queryStr);
//    // let query = Tour.find(JSON.parse(queryStr));

//    // //2ASorting
//    // if (req.query.sort) {
//    //    const sortBy = req.query.sort.split(',').join(' ');
//    //    query.sort(sortBy);
//    // } else {
//    //    query.sort('-createdAt');
//    // }

//    // //3AField limiting
//    // if (req.query.fields) {
//    //    const field = req.query.fields.split(',').join(' ');
//    //    query.select(field);
//    // } else {
//    //    query.select('-__v');
//    // }

//    // //4APagination
//    // if (req.query.page) {
//    //    let limit = req.query.limit * 1 || 100;
//    //    let page = req.query.page * 1;
//    //    let skip = (page - 1) * limit;
//    //    const total = await Tour.countDocuments();
//    //    if (skip >= total) {
//    //       throw new Error('The page doesnt exist');
//    //    }
//    //    query.skip(skip).limit(limit);
//    // }

//    //*******5.Execute query
//    //const tours = await query;
//or

//    const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//    const tours = await features.query;
//    console.log(tours[0]);
//    //********3.Send response
//    res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//          tours,
//       },
//    });
// });
