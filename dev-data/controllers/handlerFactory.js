const AppError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
         return next(new AppError('No document found with that ID', 404));
      }
      res.status(204).json({
         status: 'success',
         data: null,
      });
   });

exports.updateOne = (Model) =>
   catchAsync(async (req, res, next) => {
      // const id = req.params.id * 1;
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
         new: true, //returns newly updated document
         runValidators: true, //runs all validators when doc is updated like checking minlength,maxlength again while updating document
      });
      if (!doc) {
         return next(new AppError('No document found with that ID', 404));
      }
      res.status(200).json({
         status: 'success',
         data: {
            data: doc,
         },
      });
   });

exports.createOne = (Model) =>
   catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body); //creating document
      res.status(201).json({
         status: 'success',
         data: {
            data: doc,
         },
      });
   });

exports.getOne = (Model, popOptions) =>
   catchAsync(async (req, res, next) => {
      //const id = req.params.id * 1; //to convert id to string we are multiplying with 1
      let query = Model.findById(req.params.id);
      if (popOptions) {
         query = query.populate(popOptions);
      }
      const doc = await query;
      if (!doc) {
         return next(new AppError('No document found with that ID', 404));
      }
      res.status(200).json({
         status: 'success',
         result: doc.length,
         data: {
            data: doc,
         },
      });
   });

exports.getAll = (Model) =>
   catchAsync(async (req, res, next) => {
      //for review
      let filter = {};
      if (req.params.tourId) {
         filter = { tour: req.params.tourId };
      }
      console.log(filter);
      //till above line
      const features = new APIFeatures(Model.find(filter), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();
      const docs = await features.query;
      //********3.Send response
      res.status(200).json({
         status: 'success',
         result: docs.length,
         data: {
            docs,
         },
      });
   });
