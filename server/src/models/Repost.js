import mongoose from 'mongoose';

const repostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

repostSchema.index({ userId: 1, originalPostId: 1 }, { unique: true });

export const Repost = mongoose.model('Repost', repostSchema);
