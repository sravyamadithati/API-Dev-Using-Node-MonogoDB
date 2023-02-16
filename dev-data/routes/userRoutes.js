const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
//for except all above 4 requests,we need to authenticate users before performing any action
//so we add protect middleware @one place,so that for any route other than above 4,the fallowing middleware will be checked

router.use(authController.protect); //this will check if user is authenticated for any route that passes this middleware
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//all below routes can only be performed by admin
router.use(authController.restrictTo('admin'));
router
   .route('/')
   .get(userController.getAllUsers)
   .post(userController.createUser);

router
   .route('/:id')
   .get(userController.getUser)
   .patch(userController.updateUser)
   .delete(userController.deleteUser);

module.exports = router;
