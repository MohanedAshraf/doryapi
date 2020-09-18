import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Lab from '../models/Lab.js';

export default {

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/doctors/:doctorId/reviews
// @route     GET /api/v1/labs/:labId/reviews
// @access    Public
getReviews : asyncHandler(async (req, res, next) => {
  if (req.params.doctorId) {
    const reviews = await Review.find({ doctor: req.params.doctorId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } 
  else if(req.params.labId){
    const reviews = await Review.find({ lab: req.params.labId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  }
  else{
    res.status(200).json(res.advancedResults);
  }
}),

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
getReview : asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
}),

// @desc      Add review
// @route     POST /api/v1/doctors/:doctorId/reviews
// @route     POST /api/v1/labs/:labId/reviews
// @access    Private
addReview : asyncHandler(async (req, res, next) => {
  if(req.params.doctorId){
  req.body.doctor = req.params.doctorId;
  req.body.user = req.user.id;

  const doctor = await Doctor.findById(req.params.doctorId);

  if (!doctor) {
    return next(
      new ErrorResponse(
        `No doctor with the id of ${req.params.doctorId}`,
        404
      )
    );
  }

}
else if (req.params.labId){
  req.body.lab = req.params.labId;
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
}
else{
  return next(
    new ErrorResponse(
      `No lab or doctor `,
      404
    )
  );
}
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
}),

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
updateReview : asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
}),

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
deleteReview : asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
})

}