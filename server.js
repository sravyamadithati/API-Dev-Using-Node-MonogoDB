const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

//handling uncaught exceptions
process.on('uncaughtException', (err) => {
   console.log('namee', err.name + '    ' + err.message);
   process.exit(1);
});

dotenv.config({
   path: './config.env',
}); //to read environment variables

const DB = process.env.DATABASE.replace(
   '<PASSWORD>',
   process.env.DATABASE_PASSWORD
);

//connecting to mongoose database
mongoose
   .connect(DB, {
      useNewUrlParser: true, //the three options are used to avoid depreciation warnings
      useCreateIndex: true,
      useFindAndModify: false,
   })
   .then((conn) => {
      //console.log(conn.connection);
      console.log('DB connection success');
   });

//console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
   console.log('App running on port 3000');
});
//handling unhandled rejections
process.on('unhandledRejection', (err) => {
   console.log('namee', err.name + '    ' + err.message);
   server.close(() => {
      process.exit(1);
   });
});
