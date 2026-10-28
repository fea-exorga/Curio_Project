import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    caption: {
      type: String,
      required: [true, 'Caption/explanation is required'],
      trim: true,
      maxlength: [3000, 'Caption cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    contentType: {
      type: String,
      enum: ['text', 'image', 'carousel', 'video'],
      default: 'image',
      index: true,
    },
    mediaItems: [mediaItemSchema],
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    sourceName: {
      type: String,
      trim: true,
      default: '',
    },
    takeaway: {
      type: String,
      trim: true,
      maxlength: [500, 'Takeaway cannot exceed 500 characters'],
      default: '',
    },
    relatedTopics: [
      {
        type: String,
        trim: true,
      },
    ],
    editorialPriority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
      index: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null, // For hackathons / opportunity deadlines
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
    },
    repostCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
postSchema.index({
  title: 'text',
  caption: 'text',
  tags: 'text',
  takeaway: 'text',
});

// Indexes for feed queries
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ status: 1, category: 1, publishedAt: -1 });
postSchema.index({ status: 1, editorialPriority: -1, publishedAt: -1 });

export const Post = mongoose.model('Post', postSchema);
