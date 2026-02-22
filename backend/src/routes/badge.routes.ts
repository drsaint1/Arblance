import express from 'express';
import { mintBadge, checkSkill } from '../controllers/badge.controller';

const router = express.Router();

router.post('/mint', mintBadge);
router.get('/check/:address/:category', checkSkill);

export default router;
