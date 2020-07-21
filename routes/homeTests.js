const express = require('express');
const {
  getHomeTests,
  getHomeTest,
  requestHomeTest,
  updateHomeTest,
  deleteHomeTest,
  respondHomeTest
} = require('../controllers/homeTests');

const HomeTest = require('../models/HomeTest');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(HomeTest),
    getHomeTests
  )
  .post(protect, authorize('user', 'admin'), requestHomeTest)
  .put(protect, authorize('lab' , 'admin') ,respondHomeTest);

router
  .route('/:id')
  .get(getHomeTest)
  .put(protect, authorize('lab', 'admin' ), updateHomeTest)
  .delete(protect, authorize('lab', 'admin'), deleteHomeTest);

module.exports = router;
