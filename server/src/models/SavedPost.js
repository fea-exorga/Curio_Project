import mongoose from 'mongoose';

const savedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// A user can save a post once overall (or once per collection)
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavedPost = mongoose.model('SavedPost', savedPostSchema);
