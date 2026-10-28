import api from './api.js';

export const categoryService = {
  async getCategories() {
    const { data } = await api.get('/categories');
    return data.categories || [];
  },
  async createCategory(name) {
    const { data } = await api.post('/admin/categories', { name });
    return data;
  },
};

export const authService = {
  async register(userData) {
    const { data } = await api.post('/auth/register', userData);
    if (data.token) localStorage.setItem('curio_token', data.token);
    return data;
  },

  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    if (data.token) localStorage.setItem('curio_token', data.token);
    return data;
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    localStorage.removeItem('curio_token');
    return data;
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async updateInterests(interests) {
    const { data } = await api.put('/auth/interests', { interests });
    return data;
  },
};

export const userService = {
  async searchProfiles(query) {
    const { data } = await api.get('/users/search', { params: { q: query } });
    return data;
  },

  async getProfile(username) {
    const { data } = await api.get(`/users/${username}`);
    return data;
  },

  async updateProfile(updates) {
    const { data } = await api.patch('/users/me', updates);
    return data;
  },

  async uploadAvatar(file) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  },

  async followUser(userId) {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data;
  },

  async unfollowUser(userId) {
    const { data } = await api.delete(`/users/${userId}/follow`);
    return data;
  },

  async getFollowers(username) {
    const { data } = await api.get(`/users/${username}/followers`);
    return data;
  },

  async getFollowing(username) {
    const { data } = await api.get(`/users/${username}/following`);
    return data;
  },
};

export const feedService = {
  async getForYou(params = {}) {
    const { data } = await api.get('/feed/for-you', { params });
    return data;
  },

  async getFollowing(params = {}) {
    const { data } = await api.get('/feed/following', { params });
    return data;
  },

  async getExplore(params = {}) {
    const { data } = await api.get('/feed/explore', { params });
    return data;
  },
};

export const postService = {
  async getPosts(params = {}) {
    const { data } = await api.get('/posts', { params });
    return data;
  },

  async getPost(postId) {
    const { data } = await api.get(`/posts/${postId}`);
    return data;
  },

  async getReels(params = {}) {
    const { data } = await api.get('/posts/reels', { params });
    return data;
  },

  async likePost(postId) {
    const { data } = await api.put(`/posts/${postId}/like`);
    return data;
  },

  async unlikePost(postId) {
    const { data } = await api.delete(`/posts/${postId}/like`);
    return data;
  },

  async getComments(postId) {
    const { data } = await api.get(`/posts/${postId}/comments`);
    return data;
  },

  async addComment(postId, text) {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return data;
  },

  async deleteComment(commentId) {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  },

  async savePost(postId, collectionId = null) {
    const { data } = await api.put(`/posts/${postId}/save`, { collectionId });
    return data;
  },

  async unsavePost(postId) {
    const { data } = await api.delete(`/posts/${postId}/save`);
    return data;
  },

  async repost(postId) {
    const { data } = await api.post(`/posts/${postId}/repost`);
    return data;
  },

  async unrepost(postId) {
    const { data } = await api.delete(`/posts/${postId}/repost`);
    return data;
  },
};

export const savedService = {
  async getSaved(params = {}) {
    const { data } = await api.get('/collections/saved', { params });
    return data;
  },

  async getCollections() {
    const { data } = await api.get('/collections');
    return data;
  },

  async createCollection(collectionData) {
    const { data } = await api.post('/collections', collectionData);
    return data;
  },

  async deleteCollection(collectionId) {
    const { data } = await api.delete(`/collections/${collectionId}`);
    return data;
  },

  async addPostToCollection(collectionId, postId) {
    const { data } = await api.post(`/collections/${collectionId}/posts/${postId}`);
    return data;
  },

  async removePostFromCollection(collectionId, postId) {
    const { data } = await api.delete(`/collections/${collectionId}/posts/${postId}`);
    return data;
  },
};

export const adminService = {
  async getOverview() {
    const { data } = await api.get('/admin/overview');
    return data;
  },

  async getPosts(params = {}) {
    const { data } = await api.get('/admin/posts', { params });
    return data;
  },

  async createPost(postData) {
    const { data } = await api.post('/admin/posts', postData);
    return data;
  },

  async uploadMedia(files) {
    const form = new FormData();
    [...files].forEach((file) => form.append('files', file));
    const { data } = await api.post('/admin/media', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 });
    return data;
  },

  async updatePost(postId, postData) {
    const { data } = await api.patch(`/admin/posts/${postId}`, postData);
    return data;
  },

  async deletePost(postId) {
    const { data } = await api.delete(`/admin/posts/${postId}`);
    return data;
  },
};
