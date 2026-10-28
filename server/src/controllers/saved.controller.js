import { Post } from '../models/Post.js';
import { SavedPost } from '../models/SavedPost.js';
import { Collection } from '../models/Collection.js';
import { enrichPostsWithUserData } from '../utils/postHelpers.js';

// @desc    Get all saved posts for the current user
// @route   GET /api/saved
export const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { collectionId } = req.query;

    if (collectionId && !(await Collection.exists({ _id: collectionId, userId }))) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const query = { userId };
    if (collectionId) query.collectionId = collectionId;

    const savedRecords = await SavedPost.find(query)
      .populate({
        path: 'postId',
        populate: { path: 'author', select: 'username displayName avatarUrl role' },
      })
      .sort({ createdAt: -1 });

    const visibleRecords = savedRecords.filter((record) => record.postId && record.postId.status === 'published');
    const savedPosts = visibleRecords.map((record) => record.postId);

    const enriched = await enrichPostsWithUserData(savedPosts, userId);
    const posts = enriched.map((post, index) => ({
      ...post,
      savedCollectionId: visibleRecords[index].collectionId?.toString() || '',
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all collections for the current user
// @route   GET /api/collections
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach post count to each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const count = await SavedPost.countDocuments({ userId: req.user._id, collectionId: col._id });
        return { ...col.toObject(), postCount: count };
      })
    );

    res.status(200).json({
      success: true,
      collections: collectionsWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new collection
// @route   POST /api/collections
export const createCollection = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required.' });
    }
    if (name.trim().length > 60 || (description && (typeof description !== 'string' || description.trim().length > 200))) {
      return res.status(400).json({ success: false, message: 'Collection names can be up to 60 characters and descriptions up to 200.' });
    }

    const collection = await Collection.create({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Collection created.',
      collection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a collection
// @route   PATCH /api/collections/:collectionId
export const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.collectionId,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const { name, description } = req.body;
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 60) return res.status(400).json({ success: false, message: 'Collection name must be between 1 and 60 characters.' });
      collection.name = name.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length > 200) return res.status(400).json({ success: false, message: 'Description cannot exceed 200 characters.' });
      collection.description = description.trim();
    }
    await collection.save();

    res.status(200).json({ success: true, message: 'Collection updated.', collection });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a collection
// @route   DELETE /api/collections/:collectionId
export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.collectionId,
      userId: req.user._id,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    // Move posts from this collection to "unsorted"
    await SavedPost.updateMany(
      { userId: req.user._id, collectionId: req.params.collectionId },
      { $set: { collectionId: null } }
    );

    res.status(200).json({ success: true, message: 'Collection deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a saved post to a collection
// @route   POST /api/collections/:collectionId/posts/:postId
export const addPostToCollection = async (req, res, next) => {
  try {
    const { collectionId, postId } = req.params;
    const userId = req.user._id;

    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const savedPost = await SavedPost.findOneAndUpdate({ userId, postId }, { collectionId }, { new: true });
    if (!savedPost) return res.status(404).json({ success: false, message: 'Save this post before adding it to a collection.' });

    res.status(200).json({ success: true, message: 'Post added to collection.', savedPost });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove post from a collection (move to unsorted)
// @route   DELETE /api/collections/:collectionId/posts/:postId
export const removePostFromCollection = async (req, res, next) => {
  try {
    await SavedPost.findOneAndUpdate(
      { userId: req.user._id, postId: req.params.postId, collectionId: req.params.collectionId },
      { $set: { collectionId: null } }
    );

    res.status(200).json({ success: true, message: 'Post removed from collection.' });
  } catch (error) {
    next(error);
  }
};
