import express from 'express';
import path ,{dirname} from 'path';
import { fileURLToPath } from 'url';
 const __dirname = dirname(fileURLToPath(import.meta.url));
import multer from "multer";

import labs from '../controllers/labs.js';
import Lab from '../models/Lab.js';


// Include other resource routers
import reviewRouter from './reviews.js';
import homeTestRouter from './homeTests.js';

const router = express.Router();

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';

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
  
  }).single("file") , labs.labPhotoUpload); 

router.route('/radius/:latitude/:longitude/:distance').get(labs.getLabsInRadius);

router
  .route('/')
  .get(advancedResults(Lab), labs.getLabs)
  .post(protect, authorize('admin'), labs.createLab);

router
  .route('/:id')
  .get(labs.getLab)
  .put(protect,  authorize('admin', 'lab'), labs.updateLab)
  .delete(protect, authorize('admin'), labs.deleteLab);

  router.post('/auth/register', labs.register);
  router.post('/auth/login', labs.login);
  router.get('/auth/logout', protect , authorize('lab') , labs.logout);
  router.get('/auth/me', protect,authorize("admin" ,"lab"), labs.getMe);


export default router; 
