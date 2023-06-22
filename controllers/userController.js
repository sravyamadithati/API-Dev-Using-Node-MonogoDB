const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

// stores file in file system
// const multerStorage = multer.diskStorage({
//    destination: (req, file, cb) => {
//       cb(null, 'public/img/users');
//    },
//    filename: (req, file, cb) => {
//       const ext = file.mimetype.split('/')[1];
//       cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//    },
// });

//storing image as buffer(so that we can do image processing).
//Buffer is the representation of image in memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
   if (file?.mimetype.startsWith('image')) {
      cb(null, true);
   } else {
      cb(new AppError('Not an image!!Please upload an image.', 400), false);
   }
};

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
   if (!req.file) return next();
   //since the filename will not be availble at this step,we are adding filename field to req.file .
   //we are also adding extension as jpeg directly(since we final convert the images to jpeg in next step)
   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg') //converting image type to jpeg
      .jpeg({ quality: 90 }) //compressing the image
      .toFile(`public/img/users/${req.file.filename}`); //writing file to filesystem
   next();
});

const filterObj = (obj, allowedFields) => {
   const newObject = {};
   Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
         newObject[el] = obj[el];
      }
   });
   return newObject;
};

exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route not defined.Please use /signup route',
   });
};

exports.updateMe = catchAsync(async (req, res, next) => {
   if (req.body.password || req.body.passwordConfirm) {
      return next(
         new AppError(
            'This route is not for password updates.Please use /updatePassword route'
         )
      );
   }
   //fiilter data so that we can update only name/email
   const filteredObject = filterObj(req.body, ['name', 'email']);
   //if file is present on req object,we are updating photo field with user uploaded photo(we will get the filename from req.file)
   if (req.file) {
      filteredObject.photo = req.file.filename;
   }
   const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredObject,
      {
         new: true,
         runValidators: true,
      }
   );
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
exports.getMe = (req, res, next) => {
   req.params.id = req.user.id;
   next();
};
exports.getUser = factory.getOne(User);
//or we can use below
// exports.getUser = (req, res, next) => {
//     res.status(200).json({
//      status: 'success',
//      data: { user: req.user },
//    });
//  };
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
