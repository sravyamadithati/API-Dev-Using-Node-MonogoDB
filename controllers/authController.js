const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const sendMail = require('../utils/email');

const signToken = (id) => {
   return jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

const createSendToken = (user, statusCode, res) => {
   const token = signToken(user._id);
   const cookieOption = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
   };
   if (process.env.NODE_ENV === 'production') {
      cookieOption.secure = true;
   }
   res.cookie('jwt', token, cookieOption);
   user.password = undefined;
   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user,
      },
   });
};
exports.signUp = catchAsync(async (req, res, next) => {
   const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      //role:req.body?.role
   });
   createSendToken(newUser, 201, res);
   // const token = signToken(newUser._id);
   // res.status(201).json({
   //    status: 'success',
   //    token,
   //    data: {
   //       user: newUser,
   //    },
   // });
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;
   //check if user has provided both email and password
   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }
   //check if email exists in database.If exists,select password also
   const user = await User.findOne({ email }).select('+password');
   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
   }
   createSendToken(user, 200, res);
   // const token = signToken(user._id);
   // res.status(200).json({
   //    status: 'success',
   //    token,
   // });
});

exports.protect = catchAsync(async (req, res, next) => {
   //1.get token and check if it is there
   let token;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
   }
   console.log(token);
   if (!token) {
      next(
         new AppError(
            'You are not logged in! Please log in to get access.',
            401
         )
      );
   }
   //2.verify token
   const decoded = await jwt.verify(token, process.env.JWT_SECRET);
   //console.log(isValidToken);

   //3.check if user still exists(to handle scenario:If user got removed in mean time)
   const freshUser = await User.findById(decoded.id);
   if (!freshUser) {
      return next(
         new AppError('The user belonging to this token no longer exists', 401)
      );
   }
   //4.Check if user changes password,after JWT is issued
   if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
         new AppError('User recently changed password.Please login again!', 401)
      );
   }
   //grant access to protected route
   req.user = freshUser;
   next();
});

//Only for rendered pages,not to display errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
   //1.get token and check if it is there
   if (req.cookies?.jwt) {
      //2.verify token
      const decoded = await jwt.verify(
         req.cookies?.jwt,
         process.env.JWT_SECRET
      );
      //console.log(isValidToken);

      //3.check if user still exists(to handle scenario:If user got removed in mean time)
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
         return next();
      }
      //4.Check if user changes password,after JWT is issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
         return next();
      }
      //grant access to protected route
      res.locals.user = freshUser;
      return next();
   }
   next();
});

exports.restrictTo = (...roles) => {
   return (req, res, next) => {
      //roles ['admin','lead-guide']
      if (!roles.includes(req.user.role)) {
         //req.user is available from authoController.protect function
         next(
            new AppError(
               'You do not have permissions to perform this action',
               403
            )
         );
      }
      next();
   };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
   //Get user based on posted email
   const user = await User.findOne({ email: req.body.email });
   if (!user) {
      return next(new AppError('There is no user with email address', 404));
   }
   //Generate random token
   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false }); //this.will prevent the err message(Please provide email and password)
   const resetUrl = `${req.protocol}://${req.get(
      'host'
   )}//api/v1/users/resetPassword/${resetToken}`;
   const message = `Forgot your password? Submit a patch request with new password and passwordConfirm to ${resetUrl}.\nIf you didn't forget your password,Please ignore this email!`;

   try {
      await sendMail({
         email: user.email,
         subject: 'Your password reset token(valid for 10 min)',
         message,
      });
      res.status(200).json({
         status: 'success',
         message: 'Token sent to email',
      });
   } catch (err) {
      //console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
         new AppError(
            'There was an error sending the email.Please try again',
            500
         )
      );
   }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
   //1.Get user based on token
   const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex'); //here,we are encrpting the token and comparing with reset token in database
   //we will get user details based on hashed token and only if token not expired
   const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
   });
   //2.check if user password rest token is expired
   console.log('user', user);
   if (!user) {
      return next(new AppError('Token is invalid or expired', 400));
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save();
   createSendToken(user, 200, res);
   // const token = signToken(user._id);
   // res.status(200).json({
   //    status: 'success',
   //    token,
   // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
   const { email } = req.user;
   //1.Get user from collection
   const user = await User.findOne({ email }).select('+password');
   //2.Check if password entered by user is correct
   if (
      !user ||
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
   ) {
      return next(new AppError('Please enter correct password'));
   }
   //3.If so,update password
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   await user.save();
   //4.Log user,send JWT
   createSendToken(user, 200, res);
   // const token = signToken(user._id);
   // res.status(200).json({
   //    status: 'success',
   //    token,
   // });
});
