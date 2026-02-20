import express from 'express';
import { disputeController } from '../controllers/dispute.controller';

const router = express.Router();

// Public routes
router.post('/', disputeController.createDispute);
router.get('/:disputeId', disputeController.getDispute);
router.get('/user/:walletAddress', disputeController.getUserDisputes);
router.post('/:disputeId/evidence', disputeController.submitEvidence);

// Admin routes (in production, add admin authentication middleware)
router.get('/', disputeController.getAllDisputes);
router.put('/:disputeId/status', disputeController.updateDisputeStatus);
router.put('/:disputeId/resolve', disputeController.resolveDispute);
router.get('/stats/all', disputeController.getDisputeStats);

export default router;
