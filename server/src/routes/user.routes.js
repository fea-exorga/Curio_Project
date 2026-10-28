import express from 'express';
import {
  getProfile,
  searchProfiles,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/user.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { avatarUpload } from '../middleware/mediaUpload.js';
import { uploadAvatar } from '../controllers/media.controller.js';

const router = express.Router();

router.get('/search', optionalAuth, searchProfiles);
router.get('/:username', optionalAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);
router.post('/me/avatar', requireAuth, avatarUpload.single('file'), uploadAvatar);
router.get('/:username/followers', optionalAuth, getFollowers);
router.get('/:username/following', optionalAuth, getFollowing);
router.post('/:userId/follow', requireAuth, followUser);
router.delete('/:userId/follow', requireAuth, unfollowUser);

export default router;
