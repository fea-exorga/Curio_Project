import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';
import { Comment } from '../models/Comment.js';
import { SavedPost } from '../models/SavedPost.js';
import { Repost } from '../models/Repost.js';
import { Collection } from '../models/Collection.js';

// @desc    Like a post
// @route   PUT /api/posts/:postId/like
export const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existing = await Like.findOne({ userId, postId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Post already liked.',
        isLiked: true,
        likeCount: post.likeCount,
      });
    }

    await Like.create({ userId, postId });
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post liked.',
      isLiked: true,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:postId/like
export const unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const deleted = await Like.findOneAndDelete({ userId, postId });
    if (!deleted) {
      const post = await Post.findById(postId);
      return res.status(200).json({
        success: true,
        message: 'Post not liked.',
        isLiked: false,
        likeCount: post ? post.likeCount : 0,
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post unliked.',
      isLiked: false,
      likeCount: Math.max(0, updatedPost ? updatedPost.likeCount : 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate('userId', 'username displayName avatarUrl role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:postId/comments
export const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment cannot exceed 1000 characters.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = await Comment.create({
      userId,
      postId,
      text: text.trim(),
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    await comment.populate('userId', 'username displayName avatarUrl role');

    res.status(201).json({
      success: true,
      message: 'Comment added.',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Only author or admin can delete
    const isAuthor = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/bookmark a post
// @route   PUT /api/posts/:postId/save
export const savePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { collectionId } = req.body;
    const userId = req.user._id;

    if (collectionId && !(await Collection.exists({ _id: collectionId, userId }))) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existing = await SavedPost.findOne({ userId, postId });
    if (existing) {
      // If collectionId changed, update it
      if (collectionId !== undefined && existing.collectionId?.toString() !== collectionId) {
        existing.collectionId = collectionId || null;
        await existing.save();
      }
      return res.status(200).json({
        success: true,
        message: 'Post already saved.',
        isSaved: true,
        saveCount: post.saveCount,
      });
    }

    await SavedPost.create({
      userId,
      postId,
      collectionId: collectionId || null,
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { saveCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post saved to bookmarks.',
      isSaved: true,
      saveCount: updatedPost.saveCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave/remove bookmark
// @route   DELETE /api/posts/:postId/save
export const unsavePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const deleted = await SavedPost.findOneAndDelete({ userId, postId });
    if (!deleted) {
      const post = await Post.findById(postId);
      return res.status(200).json({
        success: true,
        message: 'Post was not saved.',
        isSaved: false,
        saveCount: post ? post.saveCount : 0,
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { saveCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post removed from bookmarks.',
      isSaved: false,
      saveCount: Math.max(0, updatedPost ? updatedPost.saveCount : 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Repost a post
// @route   POST /api/posts/:postId/repost
export const repostPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existing = await Repost.findOne({ userId, originalPostId: postId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You have already reposted this.',
        isReposted: true,
        repostCount: post.repostCount,
      });
    }

    await Repost.create({ userId, originalPostId: postId });
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { repostCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Reposted to your profile.',
      isReposted: true,
      repostCount: updatedPost.repostCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove repost
// @route   DELETE /api/posts/:postId/repost
export const unrepostPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const deleted = await Repost.findOneAndDelete({ userId, originalPostId: postId });
    if (!deleted) {
      const post = await Post.findById(postId);
      return res.status(200).json({
        success: true,
        message: 'Post was not reposted.',
        isReposted: false,
        repostCount: post ? post.repostCount : 0,
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { repostCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Repost removed.',
      isReposted: false,
      repostCount: Math.max(0, updatedPost ? updatedPost.repostCount : 0),
    });
  } catch (error) {
    next(error);
  }
};
