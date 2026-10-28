import express from 'express';
import { getForYouFeed, getFollowingFeed, getExplore } from '../controllers/feed.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/for-you', optionalAuth, getForYouFeed);
router.get('/following', requireAuth, getFollowingFeed);
router.get('/explore', optionalAuth, getExplore);

export default router;
