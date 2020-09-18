import express from 'express';
import homeTests from '../controllers/homeTests.js';

import HomeTest from '../models/HomeTest.js';

const router = express.Router({ mergeParams: true });

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';

router
  .route('/')
  .get(
    advancedResults(HomeTest),
    homeTests.getHomeTests
  )
  .post(protect, authorize('user', 'admin'), homeTests.requestHomeTest)
  .put(protect, authorize('lab' , 'admin') , homeTests.respondHomeTest);

router
  .route('/:id')
  .get(homeTests.getHomeTest)
  .put(protect, authorize('lab', 'admin' ), homeTests.updateHomeTest)
  .delete(protect, authorize('lab', 'admin'), homeTests.deleteHomeTest);

export default router;
