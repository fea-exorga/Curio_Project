import { Like } from '../models/Like.js';
import { SavedPost } from '../models/SavedPost.js';
import { Repost } from '../models/Repost.js';

export const enrichPostsWithUserData = async (posts, userId) => {
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p._id);

  let likedPostIds = new Set();
  let savedPostIds = new Set();
  let repostedPostIds = new Set();

  if (userId) {
    const [likes, saves, reposts] = await Promise.all([
      Like.find({ userId, postId: { $in: postIds } }).select('postId'),
      SavedPost.find({ userId, postId: { $in: postIds } }).select('postId'),
      Repost.find({ userId, originalPostId: { $in: postIds } }).select('originalPostId'),
    ]);

    likedPostIds = new Set(likes.map((l) => l.postId.toString()));
    savedPostIds = new Set(saves.map((s) => s.postId.toString()));
    repostedPostIds = new Set(reposts.map((r) => r.originalPostId.toString()));
  }

  return posts.map((post) => {
    const p = post.toObject ? post.toObject() : { ...post };
    const idStr = p._id.toString();
    return {
      ...p,
      isLiked: likedPostIds.has(idStr),
      isSaved: savedPostIds.has(idStr),
      isReposted: repostedPostIds.has(idStr),
    };
  });
};
