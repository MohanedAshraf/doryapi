import express from 'express';
import appointments from '../controllers/appointments.js';

import Appointment from '../models/Appointment.js';

const router = express.Router({ mergeParams: true });

import advancedResults  from'../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';

router
  .route('/')
  .get(
    advancedResults(Appointment),
    appointments.getAppointments
  )
  .post(protect, authorize('user','admin') , appointments.bookAppointment)
  .put(protect, authorize('doctor','admin') , appointments.scanAppointmentByQR)
  

router
  .route('/:id')
  .get(appointments.getAppointment)
  .put(protect, authorize('doctor','admin') , appointments.updateAppointment)
  .delete(protect, authorize('admin'), appointments.deleteAppointment);

export default router ;
