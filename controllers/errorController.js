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
      console.error(item.message);
      return item.message;
   });
   return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJsonWebTokenError = () =>
   new AppError('Invalid token.Please log in again!');

const handleJwtExpiredError = () =>
   new AppError('Your token has expired.Please login again!');
const sendErrorDev = (res, err) => {
   res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
   });
};

const sendErrorProd = (res, err) => {
   //Operation,trusted error:send message to clien
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
};

module.exports = (err, req, res, next) => {
   console.log(err);

   err.statusCode = err.statusCode || 500;
   err.status = err.status || 'error';
   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(res, err);
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
      sendErrorProd(res, error);
   }
};
