import express from 'express';
import multer from "multer";

import path ,{dirname} from 'path';
import { fileURLToPath } from 'url';
 const __dirname = dirname(fileURLToPath(import.meta.url));

import doctors from '../controllers/doctors.js';

import Doctor from '../models/Doctor.js';


// Include other resource routers
import reviewRouter from './reviews.js';
import scheduleRouter from './schedules.js';
import appointmentRouter from './appointments.js';

const router = express.Router();

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';

// Re-route into other resource routers
router.use('/:doctorId/reviews', reviewRouter);
router.use('/:doctorId/schedules', scheduleRouter);
router.use('/schedules', scheduleRouter);
router.use('/appointments/:appointmentId/qr', appointmentRouter);


router
  .route('/:id/photo')
  .get(doctors.doctorPhotoRetrieve)
  .put(protect , authorize('admin' , 'doctor'),multer({
    storage : multer.diskStorage({
        destination : (req , file  , cb) =>{
            cb(null , path.join(__dirname, '../' , 'public' , 'uploads'))
        },
        filename : (req , file  , cb) =>{
            cb(null , req.user.id + '-' + file.originalname)
        }
    })
  
  }).single("file") , doctors.doctorPhotoUpload);
  

router.route('/radius/:latitude/:longitude/:distance').get(doctors.getDoctorsInRadius);

router
  .route('/')
  .get(advancedResults(Doctor), doctors.getDoctors)
  .post(protect, authorize('admin'), doctors.createDoctor);

router
  .route('/:id')
  .get(doctors.getDoctor)
  .put(protect,  authorize('admin', 'doctor'), doctors.updateDoctor)
  .delete(protect, authorize('admin'), doctors.deleteDoctors);

  router.post('/auth/register', doctors.register);
  router.post('/auth/login', doctors.login);
  router.get('/auth/logout', protect , authorize('doctor') , doctors.logout);
  router.get('/auth/me', protect,authorize("admin" ,"doctor"), doctors.getMe);

  

export default router; 
