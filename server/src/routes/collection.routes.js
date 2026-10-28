import express from 'express';
import {
  getSavedPosts,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addPostToCollection,
  removePostFromCollection,
} from '../controllers/saved.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Saved posts
router.get('/saved', requireAuth, getSavedPosts);

// Collections
router.get('/', requireAuth, getCollections);
router.post('/', requireAuth, createCollection);
router.patch('/:collectionId', requireAuth, updateCollection);
router.delete('/:collectionId', requireAuth, deleteCollection);
router.post('/:collectionId/posts/:postId', requireAuth, addPostToCollection);
router.delete('/:collectionId/posts/:postId', requireAuth, removePostFromCollection);

export default router;
