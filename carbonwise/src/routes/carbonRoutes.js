import express from 'express';
import {
  getUserProfile, getAllUsers, allCarbonDetails,
  dashboard, electricity, wastage, transportation,
  leaderBoard, calculateAndSubmit
} from '../controllers/carbonController.js';

const router = express.Router();

router.get('/profile/:userId',       getUserProfile);
router.get('/allUsers',              getAllUsers);
router.get('/allcarbondetails',      allCarbonDetails);
router.get('/user/:userId/dashboard',     dashboard);
router.get('/user/:userId/electricity',   electricity);
router.get('/user/:userId/wastage',       wastage);
router.get('/user/:userId/transportation',transportation);
router.get('/leaderBoard/:city',            leaderBoard);
router.post('/calculateAndSubmit',          calculateAndSubmit);

export default router;
