const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/apiError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const globalErrorhandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set secure http headers
//app.use(helmet());

//below content policy headers are for leaflet package to avoid cross origin errors
const scriptSrcUrls = [
   'https://unpkg.com/',
   'https://tile.openstreetmap.org',
   'https://*.cloudflare.com/',
   'https://cdnjs.cloudflare.com/ajax/libs/axios/',
   'https://*.stripe.com',
   'https:',
   'data:',
];
const styleSrcUrls = [
   'https://unpkg.com/',
   'https://tile.openstreetmap.org',
   'https://fonts.googleapis.com/',
   'https:',
];
const connectSrcUrls = [
   'https://unpkg.com',
   'https://tile.openstreetmap.org',
   'https://*.cloudflare.com/',
   'http://127.0.0.1:3000',
];
const fontSrcUrls = [
   'fonts.googleapis.com',
   'fonts.gstatic.com',
   'https:',
   'data:',
];
const frameSrcUrls = ['https://*.stripe.com'];

app.use(
   helmet({
      crossOriginEmbedderPolicy: false,
   })
);

app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: ["'self'", 'data:', 'blob:'],
         baseUri: ["'self'"],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", 'data:', 'blob:'],
         objectSrc: ["'none'"],
         imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
         fontSrc: ["'self'", ...fontSrcUrls],
         childSrc: ["'self'", 'blob:'],
         frameSrc: ["'self'", ...frameSrcUrls],
         upgradeInsecureRequests: [],
      },
   })
);

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
//for parsing form-data,we user urlencoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//parser data from cookies
app.use(cookieParser());

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

// app.get('/', (req, res) => {
//    res.status(200).render('base');
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
app.use('/', viewRouter);
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
