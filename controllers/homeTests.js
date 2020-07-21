const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const HomeTest = require('../models/HomeTest');
const Lab = require('../models/Lab');
const User = require('../models/User');

// @desc      Get homeTests
// @route     GET /api/v1/homeTests
// @route     GET /api/v1/labs/:labId/homeTests
// @route     GET /api/v1/users/:userId/homeTests
// @access    Public
exports.getHomeTests = asyncHandler(async (req, res, next) => {
  if (req.params.labId) {
    const homeTests = await HomeTest.find({ lab: req.params.labId });

    return res.status(200).json({
      success: true,
      count: homeTests.length,
      data: homeTests
    });
  }
  else if(req.params.userId){
    const homeTests = await HomeTest.find({ user: req.params.userId });

    return res.status(200).json({
      success: true,
      count: homeTests.length,
      data: homeTests
    });
  }
   else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single homeTest
// @route     GET /api/v1/homeTests/:id
// @access    Public
exports.getHomeTest = asyncHandler(async (req, res, next) => {
  const homeTest = await HomeTest.findById(req.params.id);

  if (!homeTest) {
    return next(
      new ErrorResponse(`No homeTest found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: homeTest
  });
});

// @desc      Request a homeTest
// @route     POST /api/v1/labs/:labId/homeTests
// @access    Private
exports.requestHomeTest = asyncHandler(async (req, res, next) => {
  req.body.lab = req.params.labId;
 

  const lab = await Lab.findById(req.params.doctorId);

  if (!lab) {
    return next(
      new ErrorResponse(
        `No lab with the id of ${req.params.labId}`,
        404
      )
    );
  }
  
  req.body.labName = lab.name;
  const homeTest = await HomeTest.create(req.body);

  res.status(201).json({
    success: true,
    data: homeTest
  });
});

// @desc      Respond to HomeTest
// @route     PUT /api/v1/labs/:labId/homeTests/:homeTestId
// @access    Private
exports.respondHomeTest = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
 

  const lab = await Lab.findById(req.params.labId);

  if (!lab) {
    return next(
      new ErrorResponse(
        `No lab with the id of ${req.params.labId}`,
        404
      )
    );
  }
  let homeTest = await HomeTest.findById(req.params.homeTestId);
  

  if (!homeTest) {
    return next(
      new ErrorResponse(`No homeTest with the id of ${req.params.homeTestId}`, 404)
    );
  }
  if(homeTest.lab.toString() !== req.params.labId){
    return next(
      new ErrorResponse(`No appointment with the id of ${req.params.id} belong to this lab`, 404)
    );
  }
  
  homeTest = await HomeTest.findByIdAndUpdate(req.params.homeTestId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    success: true,
    data: homeTest
  });
});


// @desc      Update homeTest
// @route     PUT /api/v1/homeTests/:id
// @access    Private
exports.updateHomeTest= asyncHandler(async (req, res, next) => {
  let homeTest = await HomeTest.findById(req.params.id);

  if (!homeTest) {
    return next(
      new ErrorResponse(`No homeTest with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure homeTest belongs to lab or user is admin
  if (homeTest.lab.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update homeTest`, 401));
  }

  homeTest = await HomeTest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: homeTest
  });
});

// @desc      Delete homeTest
// @route     DELETE /api/v1/homeTests/:id
// @access    Private
exports.deleteHomeTest = asyncHandler(async (req, res, next) => {
  const homeTests = await HomeTest.findById(req.params.id);

  if (!homeTests) {
    return next(
      new ErrorResponse(`No homeTests with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure homeTests belongs to user or user is admin
  if (homeTests.doctor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update homeTests`, 401));
  }

  await homeTests.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
