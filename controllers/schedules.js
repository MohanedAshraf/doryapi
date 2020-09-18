import ErrorResponse from '../utils/errorResponse.js'
import asyncHandler from '../middleware/async.js'
import Schedule from '../models/Schedule.js'
import Doctor from '../models/Doctor.js'

export default {
  // @desc      Get schedules
  // @route     GET /api/v1/schedules
  // @route     GET /api/v1/doctors/:doctorId/schedules
  // @access    Public
  getSchedules: asyncHandler(async (req, res, next) => {
    if (req.params.doctorId) {
      const schedules = await Schedule.find({ doctor: req.params.doctorId })

      return res.status(200).json({
        success: true,
        count: schedules.length,
        data: schedules
      })
    } else {
      res.status(200).json(res.advancedResults)
    }
  }),

  // @desc      Get single schedule
  // @route     GET /api/v1/schedules/:id
  // @access    Public
  getSchedule: asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return next(
        new ErrorResponse(
          `No Schedule found with the id of ${req.params.id}`,
          404
        )
      )
    }

    res.status(200).json({
      success: true,
      data: schedule
    })
  }),

  // @desc      Add schedule
  // @route     POST /api/v1/doctors/schedules
  // @access    Private
  addSchedule: asyncHandler(async (req, res, next) => {
    req.body.doctor = req.user.id

    if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
      return next(
        new ErrorResponse('Only doctors and admins can add schedules', 404)
      )
    }

    const doctor = await Doctor.findById(req.user.id)

    if (!doctor) {
      return next(
        new ErrorResponse(
          `No doctor with the id of ${req.params.doctorId}`,
          404
        )
      )
    }
    // req.body.sessionCost = doctor.sessionCost;
    const schedules = await Schedule.create(req.body)

    res.status(201).json({
      success: true,
      data: schedules
    })
  }),

  // @desc      Update schedule
  // @route     PUT /api/v1/schedules/:id
  // @access    Private
  updateSchedule: asyncHandler(async (req, res, next) => {
    let schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return next(
        new ErrorResponse(`No schedule with the id of ${req.params.id}`, 404)
      )
    }

    // Make sure schedule belongs to doctor or user is admin
    if (
      schedule.doctor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse('Not authorized to update appointment', 401)
      )
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: schedule
    })
  }),

  // @desc      Delete schedule
  // @route     DELETE /api/v1/schedules/:id
  // @access    Private
  deleteSchedule: asyncHandler(async (req, res, next) => {
    const schedule = await Schedule.findById(req.params.id)

    if (!schedule) {
      return next(
        new ErrorResponse(`No schedule with the id of ${req.params.id}`, 404)
      )
    }

    // Make sure schedule belongs to user or user is admin
    if (
      schedule.doctor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(new ErrorResponse('Not authorized to update schedule', 401))
    }

    await schedule.remove()

    res.status(200).json({
      success: true,
      data: {}
    })
  })
}
