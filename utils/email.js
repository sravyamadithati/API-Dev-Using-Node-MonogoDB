const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.from = `Sravya ${process.env.EMAIL_FROM}`;
      this.url = url;
      this.firstName = user.name.split(' ')[0];
   }
   createTransport() {
      if (process.env.NODE_ENV === 'production') {
         return 1;
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
         secure: false,
         //logger: true,
      });
   }
   async send(template, subject) {
      //render htm    l based on pug template
      const html = pug.renderFile(
         `${__dirname}/../views/email/${template}.pug`,
         {
            firstName: this.firstName,
            url: this.url,
            subject,
         }
      );
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: convert(html),
         //html:
      };
      //3.Create a transport and Send the email
      await this.createTransport().sendMail(mailOptions);
   }
   async sendWelcome() {
      await this.send('welcome', 'Welcome To Natours Family!!');
   }

   async sendPasswordReset() {
      await this.send(
         'passwordReset',
         'Your password reset token(valid only for 10 minutes)'
      );
   }
};

// const sendMail = async (options) => {
//    //1.create a transporter
//    const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//          user: process.env.EMAIL_USERNAME,
//          pass: process.env.EMAIL_PASSWORD,
//       },
//       secure: false,
//       //logger: true,
//    });
//    //console.log(transporter);
//    //2.Define email option
//    const mailOptions = {
//       from: 'srvya.m@gmail.com',
//       to: options.email,
//       subject: options.subject,
//       text: options.message,
//       //html:
//    };
//    //3.Send the email
//    await transporter.sendMail(mailOptions);
// };

// module.exports = sendMail;
