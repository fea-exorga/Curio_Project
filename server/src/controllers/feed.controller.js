import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';
import { SavedPost } from '../models/SavedPost.js';
import { Follow } from '../models/Follow.js';
import { Repost } from '../models/Repost.js';
import { enrichPostsWithUserData } from '../utils/postHelpers.js';
import { getAllCategoryNames } from '../utils/categoryHelpers.js';

// Deterministic scoring function for a post given user affinity profile
const computePostScore = (post, affinityMap, userInterestsSet) => {
  let score = 0;

  // 1. Editorial priority (base score 1 to 10 scaled)
  const priority = post.editorialPriority || 5;
  score += priority * 2.0;

  // 2. Direct user declared interest bonus
  if (userInterestsSet && userInterestsSet.has(post.category)) {
    score += 8.0;
  }

  // 3. User interaction category affinity bonus (likes/saves)
  const categoryAffinity = affinityMap[post.category] || 0;
  score += Math.min(categoryAffinity * 1.5, 12.0); // capped at 12

  // 4. Recency bonus
  const now = Date.now();
  const postAgeHours = Math.max(0, (now - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60));
  if (postAgeHours <= 24) {
    score += 6.0;
  } else if (postAgeHours <= 72) {
    score += 4.0;
  } else if (postAgeHours <= 168) { // 7 days
    score += 2.0;
  }

  // 5. Richness bonus (carousels, takeaways, sources)
  if (post.takeaway && post.takeaway.length > 10) score += 1.5;
  if (post.sourceUrl) score += 1.0;
  if (post.contentType === 'carousel') score += 1.0;

  return score;
};

// @desc    Get personalized "For You" feed
// @route   GET /api/feed/for-you
export const getForYouFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 30);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);

    const user = req.user;
    const affinityMap = {};
    const userInterestsSet = new Set(user?.interests || []);

    // Build category affinity weights based on recent user behavior
    if (user) {
      const [recentLikes, recentSaves] = await Promise.all([
        Like.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(40)
          .populate('postId', 'category'),
        SavedPost.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(30)
          .populate('postId', 'category'),
      ]);

      recentLikes.forEach((l) => {
        if (l.postId?.category) {
          affinityMap[l.postId.category] = (affinityMap[l.postId.category] || 0) + 1.2;
        }
      });

      recentSaves.forEach((s) => {
        if (s.postId?.category) {
          affinityMap[s.postId.category] = (affinityMap[s.postId.category] || 0) + 2.0;
        }
      });
    }

    // Base query for active published posts
    const query = { status: 'published' };
    if (category) {
      query.category = category;
    }

    // Fetch candidate posts (pool of recent, high-quality posts to rank)
    // We fetch a candidate batch to perform deterministic scoring and diversity interleaving
    const candidatePoolSize = 60;
    const candidates = await Post.find(query)
      .populate('author', 'username displayName avatarUrl role')
      .sort({ publishedAt: -1 })
      .limit(candidatePoolSize);

    if (candidates.length === 0) {
      return res.status(200).json({
        success: true,
        posts: [],
        page: parsedPage,
        hasMore: false,
        total: 0,
      });
    }

    // Compute score for each post
    const scoredPosts = candidates.map((p) => ({
      post: p,
      score: computePostScore(p, affinityMap, userInterestsSet),
    }));

    // Sort by computed score descending
    scoredPosts.sort((a, b) => b.score - a.score);

    // Apply Category Diversity Balancing:
    // To spark genuine curiosity and avoid filter bubbles,
    // prevent more than 2 consecutive posts from the exact same category.
    // Also, inject an "unexpected discovery" post every 4th slot if available.
    const balancedPosts = [];
    const remainingPosts = [...scoredPosts];
    let lastCategory = null;
    let consecutiveCategoryCount = 0;

    while (remainingPosts.length > 0 && balancedPosts.length < candidatePoolSize) {
      let selectedIndex = -1;

      // Find best candidate that respects category diversity
      for (let i = 0; i < remainingPosts.length; i++) {
        const cat = remainingPosts[i].post.category;
        if (cat !== lastCategory || consecutiveCategoryCount < 2) {
          selectedIndex = i;
          break;
        }
      }

      // If all remaining have the same category, take the first
      if (selectedIndex === -1) {
        selectedIndex = 0;
      }

      const chosen = remainingPosts.splice(selectedIndex, 1)[0];
      balancedPosts.push(chosen.post);

      if (chosen.post.category === lastCategory) {
        consecutiveCategoryCount += 1;
      } else {
        lastCategory = chosen.post.category;
        consecutiveCategoryCount = 1;
      }
    }

    // Paginate slice
    const startIndex = (parsedPage - 1) * parsedLimit;
    const pagedPosts = balancedPosts.slice(startIndex, startIndex + parsedLimit);
    const hasMore = startIndex + parsedLimit < balancedPosts.length;

    const enrichedPosts = await enrichPostsWithUserData(
      pagedPosts,
      user ? user._id : null
    );

    res.status(200).json({
      success: true,
      count: enrichedPosts.length,
      page: parsedPage,
      hasMore,
      posts: enrichedPosts,
      appliedSignals: {
        isPersonalized: !!user,
        affinityCategories: Object.keys(affinityMap),
        userInterests: Array.from(userInterestsSet),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get "Following" feed from followed users and editorial accounts
// @route   GET /api/feed/following
export const getFollowingFeed = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to view posts from accounts you follow.',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 30);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    // Get all users current user follows
    const followings = await Follow.find({ followerId: user._id }).select('followingId');
    const followingUserIds = followings.map((f) => f.followingId);

    // If not following anyone yet, suggest editorial authors or return empty with helpful flag
    if (followingUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        page: parsedPage,
        hasMore: false,
        posts: [],
        message: 'You are not following any accounts yet. Discover interesting creators and editorial channels in Explore!',
      });
    }

    // Get reposts by followed users
    const followedReposts = await Repost.find({ userId: { $in: followingUserIds } })
      .select('originalPostId userId createdAt')
      .populate('userId', 'username displayName avatarUrl');

    const repostedPostIds = followedReposts.map((r) => r.originalPostId);

    // Find posts either authored by followed users OR reposted by them
    const query = {
      status: 'published',
      $or: [
        { author: { $in: followingUserIds } },
        { _id: { $in: repostedPostIds } },
      ],
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatarUrl role')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Post.countDocuments(query),
    ]);

    const enrichedPosts = await enrichPostsWithUserData(posts, user._id);

    // Attach repost metadata if applicable
    const repostMap = {};
    followedReposts.forEach((r) => {
      repostMap[r.originalPostId.toString()] = r.userId;
    });

    const postsWithRepostMeta = enrichedPosts.map((p) => {
      const reposter = repostMap[p._id.toString()];
      return {
        ...p,
        repostedBy: reposter || null,
      };
    });

    res.status(200).json({
      success: true,
      count: postsWithRepostMeta.length,
      total,
      page: parsedPage,
      hasMore: skip + postsWithRepostMeta.length < total,
      posts: postsWithRepostMeta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explore / Discovery endpoint
// @route   GET /api/explore
export const getExplore = async (req, res, next) => {
  try {
    const { category, q, tag } = req.query;

    const query = { status: 'published' };
    if (category) query.category = category;
    if (tag) query.tags = tag.toLowerCase();

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { caption: searchRegex },
        { tags: searchRegex },
        { takeaway: searchRegex },
      ];
    }

    const [posts, trendingPosts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatarUrl role')
        .sort({ publishedAt: -1 })
        .limit(24),
      Post.find({ status: 'published' })
        .populate('author', 'username displayName avatarUrl role')
        .sort({ likeCount: -1, saveCount: -1 })
        .limit(5),
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
      posts: enrichedPosts,
      trending: trendingPosts,
      categories: await getAllCategoryNames(),
    });
  } catch (error) {
    next(error);
  }
};
