import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [60, 'Collection name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Collection = mongoose.model('Collection', collectionSchema);
