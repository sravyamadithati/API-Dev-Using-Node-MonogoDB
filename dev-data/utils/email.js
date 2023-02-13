const nodemailer = require('nodemailer');

const sendMail = async (options) => {
   //1.create a transporter
   const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USERNAME,
         pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
      //logger: true,
   });
   //console.log(transporter);
   //2.Define email option
   const mailOptions = {
      from: 'srvya.m@gmail.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
      //html:
   };
   //3.Send the email
   await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
