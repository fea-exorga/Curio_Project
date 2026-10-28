import { Post } from '../models/Post.js';
import { enrichPostsWithUserData } from '../utils/postHelpers.js';

// @desc    Get single post by ID
// @route   GET /api/posts/:postId
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).populate(
      'author',
      'username displayName avatarUrl role bio'
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Post is not available.' });
    }

    // Find related posts in the same category or related topics
    const relatedPosts = await Post.find({
      _id: { $ne: post._id },
      category: post.category,
      status: 'published',
    })
      .select('title category contentType mediaItems publishedAt takeaway')
      .limit(3);

    const [enrichedPost] = await enrichPostsWithUserData(
      [post],
      req.user ? req.user._id : null
    );

    res.status(200).json({
      success: true,
      post: enrichedPost,
      relatedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts with filters and pagination
// @route   GET /api/posts
export const getPosts = async (req, res, next) => {
  try {
    const { category, tag, contentType, author, limit = 10, page = 1 } = req.query;

    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag.toLowerCase();
    if (contentType) query.contentType = contentType;
    if (author) query.author = author;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatarUrl role')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Post.countDocuments(query),
    ]);

    const enrichedPosts = await enrichPostsWithUserData(
      posts,
      req.user ? req.user._id : null
    );

    res.status(200).json({
      success: true,
      count: enrichedPosts.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      posts: enrichedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dedicated vertical short-form video reels
// @route   GET /api/posts/reels
export const getReels = async (req, res, next) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 20);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {
      status: 'published',
      contentType: 'video',
    };

    const [reels, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatarUrl')
        .sort({ editorialPriority: -1, publishedAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Post.countDocuments(query),
    ]);

    const enrichedReels = await enrichPostsWithUserData(
      reels,
      req.user ? req.user._id : null
    );

    res.status(200).json({
      success: true,
      count: enrichedReels.length,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      reels: enrichedReels,
    });
  } catch (error) {
    next(error);
  }
};
