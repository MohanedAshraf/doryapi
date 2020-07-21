const path = require('path');
const zipcodes = require('zipcodes');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Lab = require('../models/Lab');


// @desc    Get all Labs
// @route   GET /api/v1/labs
// @access  Public

exports.getLabs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single Labs
// @route   GET /api/v1/labs/:id
// @access  Public

exports.getLab = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) {
    return next(
      new ErrorResponse(
        `lab is not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: lab
  });
});

// @desc    Create new Lab
// @route   POST /api/v1/labs
// @access  Private

exports.createLab = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;


  // If the user is not an admin, they can't create lab
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} don't have access to create lab`,
        400
      )
    );
  }
  const lab = await Lab.create(req.body);
  res.status(201).json({
    success: true,
    data: lab 
  });
});

// @desc    Update lab
// @route   PUT /api/v1/labs/:id
// @access  Private

exports.updateLab = asyncHandler(async (req, res, next) => {
  let lab = await Lab.findById(req.params.id, req.body);
  if (!lab) {
    return next(
      new ErrorResponse(
        `Lab is not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is admin 
  if ( req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update lab`,
        401
      )
    );
  }

  lab = await Lab.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: lab
  });
});

// @desc    Delete lab
// @route   DELETE /api/v1/labs/:id
// @access  Private

exports.deleteLab = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id);

  if (!lab) {
    return next(
      new ErrorResponse(
        `lab is not found with id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this lab`,
        401
      )
    );
  }

  lab.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});


// @desc      Get labs within a radius
// @route     GET /api/v1/labs/radius/:latitude/:longitude/:distance
// @access    Private
exports.getLabsInRadius = asyncHandler(async (req, res, next) => {
  const { longitude , latitude , distance } = req.params;
 

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const labs = await Lab.find({
    location: { $geoWithin: { $centerSphere: [[longitude , latitude], radius] } }
  });
 labs.reverse();
  res.status(200).json({
    success: true,
    count: labs.length,
    data: labs
  });
});

// @desc      Upload photo for lab
// @route     PUT /api/v1/labs/:id/photo
// @access    Private
exports.labPhotoUpload = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id);

  if (!lab) {
    return next(
      new ErrorResponse(`Lab not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is admin
  if (req.user.role !== 'admin' && req.user.role !== 'lab') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update lab`,
        401
      )
    );
  }

  if (!req.files) {
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
  // file.name = `photo_${lab._id}${path.parse(file.name).ext}`;

  // file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
  //   if (err) {
  //     console.error(err);
  //     return next(new ErrorResponse(`Problem with file upload`, 500));
  //   }

    await Lab.findByIdAndUpdate(req.params.id, { photo: file.filename });

    res.status(200).json({
      success: true,
      data: file.filename
    });
  });
//});

// @desc      Register lab
// @route     POST /api/v1/labs/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
 //console.log(req.body);
  
  // Create lab
  const lab = await Lab.create(req.body);
  console.log(lab);

  sendTokenResponse(lab, 200, res);
});

// @desc      Login lab
// @route     POST /api/v1/labs/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for lab
  const lab = await Lab.findOne({ email:email }).select('+password');
  
  

  if (!lab) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await lab.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(lab, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/labs/auth/logout
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

// @desc      Get current logged in lab
// @route     GET /api/v1/labs/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: lab
  });
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  console.log(token);

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