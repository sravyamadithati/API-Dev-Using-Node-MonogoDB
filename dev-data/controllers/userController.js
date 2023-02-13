const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

const filterObj = (obj, allowedFields) => {
   const newObject = {};
   Object.keys(obj).forEach((el) => {
      if (allowedFields.includes[el]) {
         newObject[el] = obj[el];
      }
   });
   return newObject;
};

exports.getAllUsers = catchAsync(async (req, res) => {
   const users = await User.find();
   res.status(200).json({
      status: 'success',
      data: {
         users,
      },
   });
});

exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route not defined',
   });
};
exports.getUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route not defined',
   });
};
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
   if (req.body.password || req.body.passwordConfirm) {
      return next(
         new AppError(
            'This route is not for password updates.Please use /updatePassword route'
         )
      );
   }
   //fiilter data so that we can update only name/email
   const filteredObject = filterObj(req.body, 'name', 'email');
   const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredObject,
      {
         new: true,
         runValidators: true,
      }
   );
   console.log('updatedUser', updatedUser);
   res.status(200).json({
      status: 'success',
      data: {
         user: updatedUser,
      },
   });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
   await User.findByIdAndUpdate(req.user.id, { active: false });
   res.status(200).json({
      status: 'success',
      data: null,
   });
});
