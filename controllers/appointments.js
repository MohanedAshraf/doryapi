const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc      Get appointments
// @route     GET /api/v1/appointments
// @route     GET /api/v1/users/:userId/appointments
// @access    Public
exports.getAppointments = asyncHandler(async (req, res, next) => {
    if(req.params.userId){
      const appointments = await Appointment.find({ user: req.params.userId });
  
  
      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
        
      });
    }
     else {
      res.status(200).json(res.advancedResults);
    }
  });

// @desc      Get single appointment
// @route     GET /api/v1/appointmens/:id
// @access    Public
exports.getAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id);
    const schedule = await Schedule.findById(appointment.schedule);
  
    if (!appointment) {
      return next(
        new ErrorResponse(`No Appointment found with the id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({
      success: true,
      data: {
       appointment ,
        schedule 
      }

    });
  });

// @desc      Delete appointment
// @route     DELETE /api/v1/appointments/:id
// @access    Private
exports.deleteAppointment = asyncHandler(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id);
  
    if (!appointment) {
      return next(
        new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure appointment's user is admin
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update appointment`, 401));
    }
  
    await appointment.remove();
  
    res.status(200).json({
      success: true,
      data: {}
    });
  });
  
  // @desc      Update appointment 
  // @route     PUT /api/v1/appointments/:id
  // @access    Private
  exports.updateAppointment = asyncHandler(async (req, res, next) => {
   let appointment = await Appointment.findById(req.params.id);
  
    if (!appointment) {
      return next( 
        new ErrorResponse(`No appointment with the id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure appointment belongs to user or user is admin
    if ( !req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update appointment`, 401));
    }
  
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      success: true,
      data: appointment 
    });
  });

// @desc      Book appointment
// @route     POST /api/v1/schedules/:scheduleId/appointments
// @access    Private 
exports.bookAppointment = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    req.body.schedule = req.params.scheduleId;
  
    let schedule = await Schedule.findById(req.params.scheduleId);
    
  
    if (!schedule) {
      return next(
        new ErrorResponse(`No schedule with the id of ${req.params.id}`, 404)
      );
    }
    req.body.patientNumber = schedule.totalNumber + 1;
  
   schedule = await Schedule.findByIdAndUpdate(req.params.scheduleId, {totalNumber:req.body.patientNumber}, {
      new: true,
      runValidators: true
    });
    
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      appointment: appointment,
      schedule : schedule

    });
  });
  
 
  // @desc      SCAN appointment by QR code
  // @route     PUT /api/v1/doctors/appointments/:appointmentId/qr
  // @access    Private (doctor)
  exports.scanAppointmentByQR = asyncHandler(async (req, res, next) => {
  
    let doctor = await Doctor.findById(req.user.id);
  
    let appointment = await Appointment.findById(req.params.appointmentId);

    let schedule = await Schedule.findById(appointment.schedule);
    
  
    if (!appointment) {
      return next(
        new ErrorResponse(`No appointment with the id of ${req.params.appointmentId}`, 404)
      );
    }
    if(schedule.doctor.toString() !== req.user.id){
      return next(
        new ErrorResponse(`No appointment with the id of ${req.params.appointmentId} belong to this doctor`, 404)
      );
    }
    
    req.body.sessionBegun = true ;
    
  const curr = appointment.patientNumber;
  
   schedule = await Schedule.findByIdAndUpdate(schedule._id, {currentNumber:curr}, {
      new: true,
      runValidators: true
    });

    console.log(schedule);
  
    appointment = await Appointment.findByIdAndUpdate(req.params.appointmentId, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(201).json({
      success: true,
       appointment ,
       doctor ,
       schedule
    });
  });