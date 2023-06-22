const AppError = require('../utils/apiError');

const handleCastErrorDB = (err) => {
   const message = `Invalid ${err.path}:${err.value}`;
   return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
   const message = `Dupliacte field: ${err.keyValue.name}.Please use another value`;
   return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
   const errors = Object.values(err.errors).map((item) => {
      return item.message;
   });
   return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJsonWebTokenError = () =>
   new AppError('Invalid token.Please log in again!');

const handleJwtExpiredError = () =>
   new AppError('Your token has expired.Please login again!');
const sendErrorDev = (req, res, err) => {
   //For apis (that are accessed through postman or websites that directs access the api )
   if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
         status: err.status,
         message: err.message,
         stack: err.stack,
         error: err,
      });
   } else {
      //for a rendered website(using browsers),we will display only msg without revealing internal details
      res.status(err.statusCode).render('error', {
         title: 'Something Went Wrong!!!',
         msg: err.message,
      });
   }
};

const sendErrorProd = (req, res, err) => {
   if (req.originalUrl.startsWith('/api')) {
      //Operation,trusted error:send message to client
      if (err.isOperational) {
         res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
         });
      }
      //propgramming or other unknown error:dont leak error details
      else {
         console.error('Error', err);
         res.status(500).json({
            status: 'error',
            message: 'Something Went Wrong',
         });
      }
   } else {
      //for a rendered website(using browsers),we will display only msg without revealing internal details
      if (err.isOperational) {
         res.status(err.statusCode).render('error', {
            title: 'Something Went Wrong!',
            msg: err.message,
         });
      }
      //propgramming or other unknown error:dont leak error details
      else {
         res.status(err.statusCode).render('error', {
            title: 'Something Went Wrong!',
            msg: 'Please try again later',
         });
      }
   }
};

module.exports = (err, req, res, next) => {
   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';
   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(req, res, err);
   } else if (process.env.NODE_ENV === 'production') {
      let error = Object.create(err);
      if (error.name === 'CastError') {
         error = handleCastErrorDB(error); //for invalid ID's
      }
      if (error.code === 11000) {
         error = handleDuplicateFieldsDB(error); //For handling duplicate keys
      }
      if (error.name === 'ValidationError') {
         error = handleValidationErrorDB(error); //for handling validation errors
      }
      if (error.name === 'JsonWebTokenError') {
         error = handleJsonWebTokenError(error);
      }
      if (error.name === 'TokenExpiredError') {
         error = handleJwtExpiredError(error);
      }
      sendErrorProd(req, res, error);
   }
};
