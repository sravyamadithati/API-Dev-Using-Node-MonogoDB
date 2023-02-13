const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); //built in module
const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'Please tell us your name'],
      },
      email: {
         type: String,
         required: [true, 'Please provide your email'],
         unique: true,
         lowecase: true, //converts everything to lowercase
         validate: [validator.isEmail, 'Please provide a valid email'],
      },
      photo: String,
      role: {
         type: String,
         enum: ['user', 'guide', 'lead-guide', 'admin'],
         default: 'user',
      },
      password: {
         type: String,
         required: [true, 'Please provide a password'],
         minlength: 8,
         select: false,
      },
      passwordConfirm: {
         type: String,
         required: [true, 'Please confirm your password'],
         validate: {
            //this works only on create(user.create) and save(user.save)
            validator: function (el) {
               return el === this.password;
            },
            message: 'Passwords are not same',
         },
      },
      active: {
         type: Boolean,
         default: true,
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

userSchema.methods.correctPassword = async function (
   plainText,
   encryptedPassword
) {
   const resp = await bcrypt.compare(plainText, encryptedPassword);
   return resp;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
   //passwordChangedAt field will be available for a document onky if password is changed
   if (this.passwordChangedAt) {
      //compare jwt token created timestamp with timestamp of passwordChangedAt
      const changedTimeStamp = parseInt(
         this.passwordChangedAt.getTime() / 1000,
         10
      ); //converting the timestamp of passwordchangedat field to match with jwt timestamp
      return JWTTimestamp < changedTimeStamp;
   }
   return false;
};

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next(); //checking if password is modified or if new document is issued
   this.passwordChangedAt = Date.now() - 1000; //some times saving data to database is slower than issuing token.here we subtracting 1000ms so that we will not get token expired message

   next();
});

userSchema.pre('save', async function (next) {
   //runs this fn if password is not modified
   if (!this.isModified('password')) return next();
   this.password = await bcrypt.hash(this.password, 12);
   this.passwordConfirm = undefined; //deleting password confirm field..i.e.not storing this in database
   next();
});

userSchema.pre(/^find/, function () {
   this.find({ active: { $ne: false } });
});

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');
   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
