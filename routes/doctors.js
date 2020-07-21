const express = require('express');
const path = require('path');
const multer = require("multer");

const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctors,
  getDoctorsInRadius,
  doctorPhotoUpload,
  doctorPhotoRetrieve,
  login ,
  register , 
  logout,
  getMe
} = require('../controllers/doctors');

const Doctor = require('../models/Doctor');


// Include other resource routers
const reviewRouter = require('./reviews');
const scheduleRouter = require('./schedules');
const appointmentRouter = require('./appointments');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:doctorId/reviews', reviewRouter);
router.use('/:doctorId/schedules', scheduleRouter);
router.use('/schedules', scheduleRouter);
router.use('/appointments/:appointmentId/qr', appointmentRouter);


router
  .route('/:id/photo')
  .get(doctorPhotoRetrieve)
  .put(protect , authorize('admin' , 'doctor'),multer({
    storage : multer.diskStorage({
        destination : (req , file  , cb) =>{
            cb(null , path.join(__dirname, '../' , 'public' , 'uploads'))
        },
        filename : (req , file  , cb) =>{
            cb(null , req.user.id + '-' + file.originalname)
        }
    })
  
  }).single("file") , doctorPhotoUpload);
  

router.route('/radius/:latitude/:longitude/:distance').get(getDoctorsInRadius);

router
  .route('/')
  .get(advancedResults(Doctor), getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router
  .route('/:id')
  .get(getDoctor)
  .put(protect,  authorize('admin', 'doctor'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctors);

  router.post('/auth/register', register);
  router.post('/auth/login', login);
  router.get('/auth/logout', protect , authorize('doctor') , logout);
  router.get('/auth/me', protect,authorize("admin" ,"doctor"), getMe);

  

module.exports = router; 
