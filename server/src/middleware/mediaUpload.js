import multer from 'multer';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('Use JPEG, PNG, WebP, GIF, MP4, WebM, or MOV media.'));
    callback(null, true);
  },
});

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/') || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return callback(new Error('Profile photos must be JPEG, PNG, WebP, or GIF images.'));
    callback(null, true);
  },
});
