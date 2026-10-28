import express from 'express';
import {
  getAdminOverview,
  getAdminPosts,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { mediaUpload } from '../middleware/mediaUpload.js';
import { uploadPostMedia } from '../controllers/media.controller.js';
import { createCategory } from '../controllers/category.controller.js';

const router = express.Router();

// All admin routes require both requireAuth and requireAdmin
router.use(requireAuth, requireAdmin);

router.get('/overview', getAdminOverview);
router.post('/categories', createCategory);
router.get('/posts', getAdminPosts);
router.post('/media', mediaUpload.array('files', 8), uploadPostMedia);
router.post('/posts', createPost);
router.patch('/posts/:postId', updatePost);
router.delete('/posts/:postId', deletePost);

export default router;
