const path = require('path');
const zipcodes = require('zipcodes');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Doctor = require('../models/Doctor');


// @desc    Get all Doctors
// @route   GET /api/v1/doctors
// @access  Public

exports.getDoctors = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single Doctor
// @route   GET /api/v1/doctors/:id
// @access  Public

exports.getDoctor = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(
      new ErrorResponse(
        `doctor is not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: doctor
  });
});

// @desc    Create new Doctor
// @route   POST /api/v1/doctors
// @access  Private

exports.createDoctor = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;


  // If the user is not an admin, they can't create doctor
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} don't have access to create doctor`,
        400
      )
    );
  }
  const doctor = await Doctor.create(req.body);
  res.status(201).json({
    success: true,
    data: doctor 
  });
});

// @desc    Update Doctor
// @route   PUT /api/v1/doctors/:id
// @access  Private

exports.updateDoctor = asyncHandler(async (req, res, next) => {
 
  const doctor = await Doctor.findById(req.params.id);
  
  if (!doctor) {
    return next(
      new ErrorResponse(
        `doctor is not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is admin 
  if ( req.user.role !== 'admin' &&  req.user.role !== 'doctor') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update doctor`,
        401
      )
    );
  }

 const  updateDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: updateDoctor
  });
});

// @desc    Delete doctor 
// @route   DELETE /api/v1/doctors/:id
// @access  Private

exports.deleteDoctors = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!Doctor) {
    return next(
      new ErrorResponse(
        `doctor is not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this doctor`,
        401
      )
    );
  }

  doctor.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get doctors within a radius
// @route     GET /api/v1/doctors/radius/:latitude/:longitude/:distance
// @access    Private
exports.getDoctorsInRadius = asyncHandler(async (req, res, next) => {
  const { longitude , latitude , distance } = req.params;
 

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const doctors = await Doctor.find({
    location: { $geoWithin: { $centerSphere: [[longitude , latitude], radius] } }
  });
doctors.reverse();
  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// @desc      Retrieve photo of doctor
// @route     GET /api/v1/doctors/:id/photo
// @access    Public
exports.doctorPhotoRetrieve = asyncHandler(async(req, res) => {

  file = req.params.id;
  console.log(req.params.id);
  const img = path.join(__dirname, '../' , 'public' , 'uploads' , file);
  console.log(img);
  
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');

});

// @desc      Upload photo for doctor
// @route     PUT /api/v1/doctors/:id/photo
// @access    Private
exports.doctorPhotoUpload = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(
      new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update doctor`,
        401
      )
    );
  }

  if (!req.file) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  // file.name = `photo_${doctor._id}${path.parse(file.name).ext}`;
  // console.log(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  
  // file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
  //   if (err) {
  //     console.error(err);
  //     return next(new ErrorResponse(`Problem with file upload`, 500));
  //   }

    await Doctor.findByIdAndUpdate(req.params.id, { photo: file.filename });
    console.log(req.file);
    res.status(200).json({
      success: true,
      data: file.filename
    });
  });
// });

// @desc      Register doctor
// @route     POST /api/v1/doctors/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
 console.log(req.body);
 
  // Create doctor
  const doctor = await Doctor.create(req.body);

  sendTokenResponse(doctor, 200, res);
});

// @desc      Login doctor
// @route     POST /api/v1/doctors/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for doctor
  const doctor = await Doctor.findOne({ email:email }).select('+password');
  
  

  if (!doctor) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await doctor.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(doctor, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/doctors/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in doctor
// @route     POST /api/v1/doctors/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: doctor
  });
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};