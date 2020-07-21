const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  googleRegister,
  facebookRegister
} = require('../controllers/users');
const passport = require("passport");
const passportConf = require("../passport");

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const appointmentRouter = require('./appointments');

// Re-route into other resource routers
router.use('/:userId/appointments', appointmentRouter);

router
  .route('/')
  .get(protect,authorize('admin'),advancedResults(User), getUsers)
  .post(protect,authorize('admin'),createUser);

router
  .route('/:id')
  .get(protect,authorize('admin'),getUser)
  .put(protect,authorize('admin'),updateUser)
  .delete(protect,authorize('admin'),deleteUser);

  //auth

  router.post('/auth/register', register);
  router.post('/auth/login', login);
  router.get('/auth/logout', protect , authorize('user') , logout);
  router.get('/auth/me', protect,authorize("admin" ,"user"), getMe);
  router.put('/auth/updatedetails', protect,authorize("admin" ,"user"), updateDetails);
  router.put('/auth/updatepassword', protect,authorize("admin" ,"user"), updatePassword);
  router.post('/auth/forgotpassword', forgotPassword);
  router.put('/auth/resetpassword/:resettoken', resetPassword);
  router.post('/auth/oauth/google', passport.authenticate("googleToken" , {session:false}) , googleRegister);
  router.post('/auth/oauth/facebook', passport.authenticate("facebookToken" , {session:false}) , facebookRegister);
  
module.exports = router;
