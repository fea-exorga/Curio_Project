import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Like } from '../models/Like.js';
import { Comment } from '../models/Comment.js';
import { Repost } from '../models/Repost.js';
import { getCanonicalCategoryName } from '../utils/categoryHelpers.js';

const validatePostMedia = (contentType, mediaItems) => {
  const allowed = ['text', 'image', 'carousel', 'video'];
  if (!allowed.includes(contentType)) return 'Choose photo, carousel, reel, or text content.';
  if (!Array.isArray(mediaItems)) return 'Media must be a list.';
  if (mediaItems.length > 8) return 'A post can contain at most 8 media items.';
  if (contentType === 'image' && mediaItems.length > 1) return 'A photo post can contain one image.';
  if (contentType === 'image' && mediaItems.length !== 1) return 'A photo post needs one image.';
  if (contentType === 'carousel' && (mediaItems.length < 2 || mediaItems.some((item) => item.type !== 'image'))) return 'A carousel needs 2 to 8 images.';
  if (contentType === 'video' && (mediaItems.length !== 1 || mediaItems[0].type !== 'video')) return 'A reel needs one video.';
  if (contentType === 'text' && mediaItems.length) return 'Text posts cannot contain media.';
  if (['image', 'carousel', 'video'].includes(contentType) && mediaItems.some((item) => !item.url || !/^https:\/\//i.test(item.url))) return 'Media must use secure https URLs.';
  return null;
};

// @desc    Admin overview stats
// @route   GET /api/admin/overview
export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalUsers,
      totalLikes,
      totalComments,
      totalReposts,
      categoryStats,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      User.countDocuments({ role: 'user' }),
      Like.countDocuments(),
      Comment.countDocuments(),
      Repost.countDocuments(),
      Post.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
        totalLikes,
        totalComments,
        totalReposts,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (with drafts) for admin
// @route   GET /api/admin/posts
export const getAdminPosts = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatarUrl role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Post.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post (admin only)
// @route   POST /api/admin/posts
export const createPost = async (req, res, next) => {
  try {
    const {
      title,
      caption,
      category,
      tags,
      contentType,
      mediaItems,
      sourceUrl,
      sourceName,
      takeaway,
      relatedTopics,
      editorialPriority,
      status,
      publishedAt,
      expiresAt,
    } = req.body;

    if (!title || !caption || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, caption, and category are required.',
      });
    }

    const canonicalCategory = await getCanonicalCategoryName(category);
    if (!canonicalCategory) return res.status(400).json({ success: false, message: 'Choose a valid category.' });

    const mediaError = validatePostMedia(contentType || 'image', mediaItems || []);
    if (mediaError) return res.status(400).json({ success: false, message: mediaError });

    const post = await Post.create({
      author: req.user._id,
      title: title.trim(),
      caption: caption.trim(),
      category: canonicalCategory,
      tags: Array.isArray(tags) ? tags.map((t) => t.toLowerCase().trim()) : [],
      contentType: contentType || 'image',
      mediaItems: Array.isArray(mediaItems) ? mediaItems : [],
      sourceUrl: sourceUrl || '',
      sourceName: sourceName || '',
      takeaway: takeaway || '',
      relatedTopics: Array.isArray(relatedTopics) ? relatedTopics : [],
      editorialPriority: editorialPriority || 5,
      status: status || 'published',
      publishedAt: publishedAt || new Date(),
      expiresAt: expiresAt || null,
    });

    await post.populate('author', 'username displayName avatarUrl role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post (admin only)
// @route   PATCH /api/admin/posts/:postId
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const allowedFields = [
      'title', 'caption', 'category', 'tags', 'contentType', 'mediaItems',
      'sourceUrl', 'sourceName', 'takeaway', 'relatedTopics', 'editorialPriority',
      'status', 'publishedAt', 'expiresAt',
    ];

    const nextContentType = req.body.contentType ?? post.contentType;
    const nextMediaItems = req.body.mediaItems ?? post.mediaItems;
    const mediaError = validatePostMedia(nextContentType, nextMediaItems);
    if (mediaError) return res.status(400).json({ success: false, message: mediaError });

    const updates = { ...req.body };
    if (req.body.category !== undefined) {
      const canonicalCategory = await getCanonicalCategoryName(req.body.category);
      if (!canonicalCategory) return res.status(400).json({ success: false, message: 'Choose a valid category.' });
      updates.category = canonicalCategory;
    }

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        post[field] = updates[field];
      }
    });

    await post.save();
    await post.populate('author', 'username displayName avatarUrl role');

    res.status(200).json({
      success: true,
      message: 'Post updated.',
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (admin only)
// @route   DELETE /api/admin/posts/:postId
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Clean up associated data
    await Promise.all([
      Like.deleteMany({ postId: req.params.postId }),
      Comment.deleteMany({ postId: req.params.postId }),
      Repost.deleteMany({ originalPostId: req.params.postId }),
    ]);

    res.status(200).json({ success: true, message: 'Post and associated data deleted.' });
  } catch (error) {
    next(error);
  }
};
