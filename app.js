const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/apiError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorhandler = require('./controllers/errorController');

const app = express();

//set secure http headers
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev')); //for logging in dev environment
}

//express-rate-limit is used to avoid brute force and denial of service attacks-limits requests from same API
const limiter = rateLimit({
   max: 100, //no.of requests
   windowMs: 60 * 60 * 1000, //for how many mill seconds?
   message: 'Too many requests from this IP,please try again in an hour', //message if user crosses the max no.of requests
});
//apply the limiter middleware to all routes that contains or starts with /api
app.use('/api', limiter);

//body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitisation against XSS
app.use(xss());

//Data sanitisation against NOSQL query injection
app.use(mongoSanitize());

//prevent parameter pollution
app.use(
   hpp({
      whitelist: [
         'duration',
         'ratingsQuantity',
         'maxGroupSize',
         'difficulty',
         'price',
         'ratingsAverage',
      ],
   })
);

//serving static files
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
   res.status(200).send('hello hai bye bye');
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//handling other routes,*->means for all urls
app.all('*', (req, res, next) => {
   // res.status(404).json({
   //    status: 'fail',
   //    message: `Can't find ${req.originalUrl} on this server`,
   // });
   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorhandler);

module.exports = app;
