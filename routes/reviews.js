import express from 'express';
import reviews from '../controllers/reviews.js';

import Review from '../models/Review.js';

const router = express.Router({ mergeParams: true });

import  advancedResults from '../middleware/advancedResults.js';
import  { protect, authorize } from '../middleware/auth.js';

router
  .route('/')
  .get(
    advancedResults(Review),
    reviews.getReviews
  )
  .post(protect, authorize('user', 'admin'), reviews.addReview);

router
  .route('/:id')
  .get(reviews.getReview)
  .put(protect, authorize('user', 'admin'), reviews.updateReview)
  .delete(protect, authorize('user', 'admin'), reviews.deleteReview);

export default router;
