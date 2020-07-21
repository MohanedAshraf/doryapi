const express = require('express');
const {
  getSchedules,
  getSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/schedules');
const Schedule = require('../models/Schedule');


// Include other resource routers
const appointmentRouter = require('./appointments');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:scheduleId/appointments', appointmentRouter);

router
  .route('/')
  .get(
    advancedResults(Schedule),
    getSchedules
  )
  .post(protect, authorize('doctor','admin') , addSchedule)

  router
  .route('/:id')
  .get(getSchedule)
  .put(protect, authorize('doctor','admin') , updateSchedule)
  .delete(protect, authorize('admin' , 'doctor'), deleteSchedule);
  
module.exports = router; 
