import express from 'express';
import { ratingController } from '../controllers/rating.controller';

const router = express.Router();

// Submit rating
router.post('/', ratingController.submitRating);

// Get user ratings
router.get('/user/:walletAddress', ratingController.getUserRatings);

// Get rating statistics for a user
router.get('/stats/:walletAddress', ratingController.getRatingStats);

// Get rating for specific job
router.get('/job/:jobId', ratingController.getJobRating);

// Get all ratings (admin)
router.get('/', ratingController.getAllRatings);

export default router;
