import express from 'express';
import { getPosts, getPostById, getReels } from '../controllers/post.controller.js';
import {
  likePost,
  unlikePost,
  getComments,
  addComment,
  deleteComment,
  savePost,
  unsavePost,
  repostPost,
  unrepostPost,
} from '../controllers/interaction.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public post browsing
router.get('/', optionalAuth, getPosts);
router.get('/reels', optionalAuth, getReels);
router.get('/:postId', optionalAuth, getPostById);

// Interactions (require auth)
router.put('/:postId/like', requireAuth, likePost);
router.delete('/:postId/like', requireAuth, unlikePost);

router.get('/:postId/comments', optionalAuth, getComments);
router.post('/:postId/comments', requireAuth, addComment);

router.put('/:postId/save', requireAuth, savePost);
router.delete('/:postId/save', requireAuth, unsavePost);

router.post('/:postId/repost', requireAuth, repostPost);
router.delete('/:postId/repost', requireAuth, unrepostPost);

export default router;
