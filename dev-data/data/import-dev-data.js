const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../models/tourModel');
dotenv.config({
   path: './config.env',
});

const DB = process.env.DATABASE.replace(
   '<PASSWORD>',
   process.env.DATABASE_PASSWORD
);

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
//read json file
const importData = async () => {
   try {
      await Tour.create(tours);
      console.log('Data inserted successfully');
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

//delete data from db
const deleteData = async () => {
   try {
      await Tour.deleteMany();
      console.log('Data deleted successfully');
   } catch (err) {
      console.log(err);
   }
   process.exit();
};

if (process.argv[2] === '__import') {
   importData();
} else if (process.argv[2] === '__delete') {
   deleteData();
}
//import data into db
