import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';


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

export default {

// @desc      google register
// @route     POST /api/v1/users/auth/oauth/google
// @access    Public
googleRegister : asyncHandler(async (req, res, next) => {

  sendTokenResponse(req.user, 200, res);
}),

// @desc      facebook register
// @route     POST /api/v1/users/auth/oauth/facebook
// @access    Public
facebookRegister : asyncHandler(async (req, res, next) => {
 
  sendTokenResponse(req.user, 200, res);
}),

// @desc      Register user
// @route     POST /api/v1/users/auth/register
// @access    Public
register : asyncHandler(async (req, res, next) => {
  const { name, email, password , address , phone , dob} = req.body;

  // Create user
  const user = await User.create({
    method:"local",
    local:{
      name: name,
     email : email,
    password:password,
    },
    phone:phone , 
    address:address,
    dob:dob

    
    
  });

  sendTokenResponse(user, 200, res);
}),

// @desc      Login user
// @route     POST /api/v1/users/auth/login
// @access    Public
login : asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ "local.email":email }).select('local.password');
  
  

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
}),

// @desc      Log user out / clear cookie
// @route     GET /api/v1/users/auth/logout
// @access    Private
logout : asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
}),

// @desc      Get current logged in user
// @route     POST /api/v1/users/auth/me
// @access    Private
getMe : asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
}),

// @desc      Update user details
// @route     PUT /api/v1/users/auth/updatedetails
// @access    Private
updateDetails : asyncHandler(async (req, res, next) => {
  
  const updateUserArgs = {
    'local.name': req.body.name,
    'local.email': req.body.email,
    ...req.body
  };
  

  const user = await User.findByIdAndUpdate(req.user.id, updateUserArgs, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
}),

// @desc      Update password
// @route     PUT /api/v1/users/auth/updatepassword
// @access    Private
updatePassword : asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+local.password');
  
  

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.local.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
}),

// @desc      Forgot password
// @route     POST /api/v1/users/auth/forgotpassword
// @access    Public
forgotPassword : asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ "local.email": req.body.email });
  
  
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url 
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.local.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
}),

// @desc      Reset password
// @route     PUT /api/v1/users/auth/resetpassword/:resettoken
// @access    Public
resetPassword : asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.local.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
}),



// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
getUsers : asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
}),

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
getUser : asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
}),

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
createUser : asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
}),

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
updateUser : asyncHandler(async (req, res, next) => {
  var updateUserArgs = {
    'local.name': req.body.name,
    'local.email': req.body.email,
    ...req.body
  };
  //console.log(updateUserArgs);
  
  const user = await User.findByIdAndUpdate(req.params.id, updateUserArgs, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
}),

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
deleteUser : asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
})

}