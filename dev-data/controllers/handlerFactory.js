const AppError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

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
