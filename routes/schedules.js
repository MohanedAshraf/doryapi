import express from 'express'
import schedules from '../controllers/schedules.js'
import Schedule from '../models/Schedule.js'

// Include other resource routers
import appointmentRouter from './appointments.js'

import advancedResults from '../middleware/advancedResults.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router({ mergeParams: true })

// Re-route into other resource routers
router.use('/:scheduleId/appointments', appointmentRouter)

router
  .route('/')
  .get(advancedResults(Schedule), schedules.getSchedules)
  .post(protect, authorize('doctor', 'admin'), schedules.addSchedule)

router
  .route('/:id')
  .get(schedules.getSchedule)
  .put(protect, authorize('doctor', 'admin'), schedules.updateSchedule)
  .delete(protect, authorize('admin', 'doctor'), schedules.deleteSchedule)

export default router
