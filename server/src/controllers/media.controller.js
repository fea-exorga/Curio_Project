import { v2 as cloudinary } from 'cloudinary';

const configured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET ||
      CLOUDINARY_CLOUD_NAME === 'your_cloud_name' || CLOUDINARY_API_KEY === 'your_api_key' || CLOUDINARY_API_SECRET === 'your_api_secret') return false;
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
  return true;
};

const upload = (file, folder) => new Promise((resolve, reject) => {
  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
    if (error) return reject(error);
    resolve({ url: result.secure_url, type: resourceType, format: result.format, bytes: result.bytes, width: result.width, height: result.height });
  });
  stream.end(file.buffer);
});

export const uploadPostMedia = async (req, res, next) => {
  try {
    if (!configured()) return res.status(503).json({ success: false, message: 'Media uploads are not configured. Set the Cloudinary environment variables on the server.' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'Choose at least one media file.' });
    if (files.length > 8) return res.status(400).json({ success: false, message: 'A carousel can contain at most 8 images.' });
    if (files.some((file) => file.mimetype.startsWith('image/') && file.size > 15 * 1024 * 1024)) return res.status(400).json({ success: false, message: 'Each image must be smaller than 15 MB.' });
    const uploaded = [];
    for (const file of files) uploaded.push(await upload(file, 'curio/posts'));
    res.status(201).json({ success: true, mediaItems: uploaded.map((item, order) => ({ ...item, order, alt: '' })) });
  } catch (error) { next(error); }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!configured()) return res.status(503).json({ success: false, message: 'Media uploads are not configured. Set the Cloudinary environment variables on the server.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image file.' });
    if (req.file.mimetype.startsWith('video/')) return res.status(400).json({ success: false, message: 'Profile photos must be images.' });
    const result = await upload(req.file, 'curio/avatars');
    res.status(201).json({ success: true, avatarUrl: result.url });
  } catch (error) { next(error); }
};
