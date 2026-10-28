export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured before authentication can run.');
  if (/^(replace_|your_|change_me)/i.test(secret.trim())) throw new Error('Replace the example JWT_SECRET with a private random value.');
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
  return secret;
};

export const validateRuntimeConfig = () => {
  if (!process.env.JWT_SECRET) throw new Error('Set JWT_SECRET in the API environment.');
  if (/^(replace_|your_|change_me)/i.test(process.env.JWT_SECRET.trim())) throw new Error('Replace the example JWT_SECRET with a private random value.');
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in the production API environment.');
    if (process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production.');
    if (!process.env.FRONTEND_URL) throw new Error('Set FRONTEND_URL to the deployed frontend origin.');
    let frontendUrl;
    try { frontendUrl = new URL(process.env.FRONTEND_URL); }
    catch { throw new Error('FRONTEND_URL must be a valid origin URL.'); }
    if (frontendUrl.protocol !== 'https:' || frontendUrl.pathname !== '/' || frontendUrl.search || frontendUrl.hash) {
      throw new Error('FRONTEND_URL must be an HTTPS origin without a path, query, or fragment.');
    }
  }
};
