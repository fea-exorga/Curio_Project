import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { Post } from '../models/Post.js';
import { Repost } from '../models/Repost.js';
import { isCategoryName } from '../utils/categoryHelpers.js';

// @desc    Get user public profile by username
// @route   GET /api/users/:username
export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [postCount, repostCount, isFollowing] = await Promise.all([
      Post.countDocuments({ author: user._id, status: 'published' }),
      Repost.countDocuments({ userId: user._id }),
      req.user
        ? Follow.exists({ followerId: req.user._id, followingId: user._id })
        : Promise.resolve(false),
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user.toSafeObject(),
        postCount,
        repostCount,
        isFollowing: !!isFollowing,
        isSelf: req.user ? req.user._id.toString() === user._id.toString() : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Search public profiles by username or display name
// @route GET /api/users/search?q=...
export const searchProfiles = async (req, res, next) => {
  try {
    const term = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 40) : '';
    if (term.length < 2) return res.status(200).json({ success: true, users: [] });
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(escaped, 'i');
    const query = { $or: [{ username: expression }, { displayName: expression }] };
    if (req.user) query._id = { $ne: req.user._id };
    const users = await User.find(query)
      .select('username displayName avatarUrl bio followersCount followingCount')
      .sort({ followersCount: -1, username: 1 })
      .limit(10)
      .lean();
    const followingIds = req.user && users.length
      ? new Set((await Follow.find({ followerId: req.user._id, followingId: { $in: users.map((user) => user._id) } }).select('followingId').lean()).map((item) => item.followingId.toString()))
      : new Set();
    res.status(200).json({
      success: true,
      users: users.map(({ _id, ...user }) => ({ ...user, _id, isFollowing: followingIds.has(_id.toString()) })),
    });
  } catch (error) { next(error); }
};

// @desc    Update current user's profile
// @route   PATCH /api/users/me
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, avatarUrl, interests, website } = req.body;

    const updates = {};
    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || !displayName.trim() || displayName.trim().length > 50) {
        return res.status(400).json({ success: false, message: 'Display name must be between 1 and 50 characters.' });
      }
      updates.displayName = displayName.trim();
    }
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 280) return res.status(400).json({ success: false, message: 'Bio cannot exceed 280 characters.' });
      updates.bio = bio.trim();
    }
    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== 'string' || (avatarUrl && !/^https:\/\//i.test(avatarUrl))) return res.status(400).json({ success: false, message: 'Avatar must be a secure image URL.' });
      updates.avatarUrl = avatarUrl.trim();
    }
    if (website !== undefined) {
      try {
        const parsedWebsite = website ? new URL(website) : null;
        if (parsedWebsite && !['http:', 'https:'].includes(parsedWebsite.protocol)) throw new Error('Invalid protocol');
        updates.website = parsedWebsite ? parsedWebsite.href : '';
      }
      catch { return res.status(400).json({ success: false, message: 'Enter a valid website URL.' }); }
    }
    if (interests !== undefined) {
      if (!Array.isArray(interests) || interests.length > 30 || !interests.every((item) => typeof item === 'string')) return res.status(400).json({ success: false, message: 'Choose valid interests.' });
      for (const item of interests) if (!(await isCategoryName(item))) return res.status(400).json({ success: false, message: `Unknown interest category: ${item}` });
      updates.interests = interests;
    }

    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'No valid profile fields were provided.' });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:userId/follow
export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found.' });
    }

    const existingFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'You are already following this user.' });
    }

    await Follow.create({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    // Update counts atomically
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
    ]);

    res.status(200).json({
      success: true,
      message: `You are now following ${targetUser.username}.`,
      isFollowing: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:userId/follow
export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const followRecord = await Follow.findOneAndDelete({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    if (!followRecord) {
      return res.status(400).json({ success: false, message: 'You are not following this user.' });
    }

    // Decrement counts atomically
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Unfollowed successfully.',
      isFollowing: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a user
// @route   GET /api/users/:username/followers
export const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const follows = await Follow.find({ followingId: user._id })
      .populate('followerId', 'username displayName avatarUrl bio')
      .sort({ createdAt: -1 })
      .limit(50);

    const followers = follows.map((f) => f.followerId).filter(Boolean);

    res.status(200).json({
      success: true,
      count: followers.length,
      followers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get following of a user
// @route   GET /api/users/:username/following
export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const follows = await Follow.find({ followerId: user._id })
      .populate('followingId', 'username displayName avatarUrl bio')
      .sort({ createdAt: -1 })
      .limit(50);

    const following = follows.map((f) => f.followingId).filter(Boolean);

    res.status(200).json({
      success: true,
      count: following.length,
      following,
    });
  } catch (error) {
    next(error);
  }
};
