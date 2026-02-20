import express from 'express';
import {
  generateJobTitles,
  generateJobDescriptions,
  improveText,
  generateMilestones,
  generateReviewSuggestions,
} from '../controllers/ai.controller';

const router = express.Router();

router.post('/generate/titles', generateJobTitles);
router.post('/generate/descriptions', generateJobDescriptions);
router.post('/improve', improveText);
router.post('/generate/milestones', generateMilestones);
router.post('/generate/review-suggestions', generateReviewSuggestions);

export default router;
