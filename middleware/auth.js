import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Lab from '../models/Lab.js';


// Protect routes
 export const protect = asyncHandler(async (req, res, next) => {
  let token;
 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    // Set token from cookie
  }
   else if (req.cookies.token) {
     token = req.cookies.token;
   }
 
  
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(await User.findById(decoded.id)){
    req.user = await User.findById(decoded.id);
    
    }
    

   else  if(await Doctor.findById(decoded.id)){
      
      
      req.user = await Doctor.findById(decoded.id);
    }
    else  if(await Lab.findById(decoded.id)){
      
      
      req.user = await Lab.findById(decoded.id);
      
    }
    else{
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
}) 

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
}

