const express = require('express');
const path = require('path');
const multer = require("multer");

const {
  getLabs,
  getLab,
  createLab,
  updateLab,
  deleteLab,
  getLabsInRadius,
  labPhotoUpload,
  login ,
  register , 
  logout, getMe
} = require('../controllers/labs');
const Lab = require('../models/Lab');


// Include other resource routers
const reviewRouter = require('./reviews');
const homeTestRouter = require('./homeTests');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:labId/reviews', reviewRouter);
router.use('/:labId/homeTests', homeTestRouter);
router.use('/:labId/homeTests/:homeTestId', homeTestRouter);

router
  .route('/:id/photo')
  .put(protect , authorize('admin' , 'lab'),multer({
    storage : multer.diskStorage({
        destination : (req , file  , cb) =>{
            cb(null , path.join(__dirname, '../' , 'public' , 'uploads'))
        },
        filename : (req , file  , cb) =>{
            cb(null , req.user.id + '-' + file.originalname)
        }
    })
  
  }).single("file") , labPhotoUpload); 

router.route('/radius/:latitude/:longitude/:distance').get(getLabsInRadius);

router
  .route('/')
  .get(advancedResults(Lab), getLabs)
  .post(protect, authorize('admin'), createLab);

router
  .route('/:id')
  .get(getLab)
  .put(protect,  authorize('admin', 'lab'), updateLab)
  .delete(protect, authorize('admin'), deleteLab);

  router.post('/auth/register', register);
  router.post('/auth/login', login);
  router.get('/auth/logout', protect , authorize('lab') , logout);
  router.get('/auth/me', protect,authorize("admin" ,"lab"), getMe);


module.exports = router; 
