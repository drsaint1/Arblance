import express from 'express';
import { getUserProfile, updateUserProfile, createUser, getAllUsers, getPlatformStats, checkUsername } from '../controllers/user.controller';

const router = express.Router();

router.post('/', createUser);
router.get('/admin/all', getAllUsers);
router.get('/admin/stats', getPlatformStats);
router.get('/check-username/:username', checkUsername);
router.get('/:walletAddress', getUserProfile);
router.put('/:walletAddress', updateUserProfile);

export default router;
