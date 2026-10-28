export const errorHandler = (err, req, res, next) => {
  console.error('[Curio Error]', {
    message: err.message,
    name: err.name,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.name === 'MulterError') {
    const isAvatar = req.originalUrl.includes('/users/me/avatar');
    const message = err.code === 'LIMIT_FILE_SIZE' ? `Media file exceeds the ${isAvatar ? '5 MB' : '100 MB'} limit.` : err.code === 'LIMIT_FILE_COUNT' ? 'Too many media files.' : 'Media upload was rejected.';
    return res.status(400).json({ success: false, message });
  }
  if (err.message?.includes('JPEG')) return res.status(400).json({ success: false, message: err.message });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: messages,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `An entry with this ${field} already exists.`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format for ${err.path}.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization token has expired. Please log in again.',
    });
  }

  // Generic internal server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
