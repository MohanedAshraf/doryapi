const express = require('express');
const {
  getAppointments,
  getAppointment,
  deleteAppointment,
  updateAppointment,
  bookAppointment,
  scanAppointmentByQR
} = require('../controllers/appointments');

const Appointment = require('../models/Appointment');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Appointment),
    getAppointments
  )
  .post(protect, authorize('user','admin') , bookAppointment)
  .put(protect, authorize('doctor','admin') , scanAppointmentByQR)
  

router
  .route('/:id')
  .get(getAppointment)
  .put(protect, authorize('doctor','admin') , updateAppointment)
  .delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;
