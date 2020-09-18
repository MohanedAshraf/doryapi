import express from'express';
import users from'../controllers/users.js';
import passport from"passport";
import "../passport.js";

import User from'../models/User.js';

const router = express.Router({ mergeParams: true });

import advancedResults from'../middleware/advancedResults.js';
import { protect, authorize } from'../middleware/auth.js';

// Include other resource routers
import appointmentRouter from'./appointments.js';

// Re-route into other resource routers
router.use('/:userId/appointments', appointmentRouter);

router
  .route('/')
  .get(protect,authorize('admin'),advancedResults(User), users.getUsers)
  .post(protect,authorize('admin'),users.createUser);

router
  .route('/:id')
  .get(protect,authorize('admin'),users.getUser)
  .put(protect,authorize('admin'),users.updateUser)
  .delete(protect,authorize('admin'),users.deleteUser);

  //auth

  router.post('/auth/register', users.register);
  router.post('/auth/login', users.login);
  router.get('/auth/logout', protect , authorize('user') , users.logout);
  router.get('/auth/me', protect,authorize("admin" ,"user"), users.getMe);
  router.put('/auth/updatedetails', protect,authorize("admin" ,"user"), users.updateDetails);
  router.put('/auth/updatepassword', protect,authorize("admin" ,"user"), users.updatePassword);
  router.post('/auth/forgotpassword', users.forgotPassword);
  router.put('/auth/resetpassword/:resettoken', users.resetPassword);
  router.post('/auth/oauth/google', passport.authenticate("googleToken" , {session:false}) , users.googleRegister);
  router.post('/auth/oauth/facebook', passport.authenticate("facebookToken" , {session:false}) , users.facebookRegister);
  
export default router;
