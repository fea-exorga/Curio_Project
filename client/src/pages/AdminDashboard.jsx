import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Trash2, Eye, EyeOff,
  FileText, Users, Heart, MessageCircle, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { adminService, categoryService } from '../services/index.js';
import { Spinner, ErrorState } from '../components/ui/States.jsx';
import { CATEGORIES, getErrorMessage } from '../utils/index.js';
import { useCategories } from '../hooks/useCategories.js';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { categories, setCategories } = useCategories();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New post modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    summary: '',
    takeaway: '',
    category: CATEGORIES[0],
    contentType: 'image',
    status: 'published',
    imageUrl: '',
    sourceUrl: '',
    sourceName: '',
    readingTime: 3,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, postsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getPosts({ limit: 50 }),
      ]);
      setStats(overviewData.stats || overviewData);
      setPosts(postsData.posts || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchData();
  }, [isAdmin, fetchData]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-ink mb-2">Access Restricted</h2>
        <p className="text-sm text-muted mb-6">You need administrator privileges to access this page.</p>
        <Link to="/" className="btn-primary">Return to Home</Link>
      </div>
    );
  }

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await adminService.updatePost(post._id, { status: newStatus });
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, status: newStatus } : p))
      );
      // update stats count
      setStats((prev) => {
        if (!prev) return prev;
        const pubDelta = newStatus === 'published' ? 1 : -1;
        return {
          ...prev,
          publishedPosts: Math.max(0, (prev.publishedPosts || 0) + pubDelta),
          draftPosts: Math.max(0, (prev.draftPosts || 0) - pubDelta),
        };
      });
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await adminService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setStats((prev) => {
        if (!prev) return prev;
        return { ...prev, totalPosts: Math.max(0, (prev.totalPosts || 1) - 1) };
      });
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.summary.trim()) {
      setModalError('Title and summary are required.');
      return;
    }
    const retainedMedia = editingPost?.mediaItems || [];
    const selectedCount = selectedFiles.length || (newPost.imageUrl ? 1 : retainedMedia.length);
    if (newPost.contentType === 'carousel' && selectedCount < 2) {
      setModalError('Choose at least two images for a carousel.');
      return;
    }
    if (newPost.contentType === 'image' && selectedCount !== 1) {
      setModalError('Choose one image for a photo post.');
      return;
    }
    if (newPost.contentType === 'video' && (selectedFiles.length ? selectedFiles.length !== 1 || !selectedFiles[0].type.startsWith('video/') : !newPost.imageUrl && (retainedMedia.length !== 1 || retainedMedia[0].type !== 'video'))) {
      setModalError('Choose one video file or provide a hosted video URL.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        title: newPost.title.trim(),
        caption: newPost.summary.trim(),
        takeaway: newPost.takeaway.trim() || newPost.summary.trim().slice(0, 100),
        category: newPost.category,
        contentType: newPost.contentType,
        status: newPost.status,
        sourceUrl: newPost.sourceUrl.trim(),
        sourceName: newPost.sourceName.trim(),
        mediaItems: newPost.contentType === 'text' ? [] : selectedFiles.length ? (await adminService.uploadMedia(selectedFiles)).mediaItems : (newPost.imageUrl ? [{ type: newPost.contentType === 'video' ? 'video' : 'image', url: newPost.imageUrl.trim(), caption: '' }] : (editingPost?.mediaItems || [])),
      };

      const res = editingPost ? await adminService.updatePost(editingPost._id, payload) : await adminService.createPost(payload);
      if (res.post) {
        setPosts((prev) => editingPost ? prev.map((post) => post._id === res.post._id ? res.post : post) : [res.post, ...prev]);
      }
      setShowModal(false);
      setEditingPost(null);
      setNewPost({
        title: '',
        summary: '',
        takeaway: '',
        category: CATEGORIES[0],
        contentType: 'image',
        status: 'published',
        imageUrl: '',
        sourceUrl: '',
        sourceName: '',
        readingTime: 3,
      });
      setSelectedFiles([]);
      fetchData();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setSelectedFiles([]);
    setModalError('');
    setNewPost({ title: post.title || '', summary: post.caption || '', takeaway: post.takeaway || '', category: post.category, contentType: post.contentType || 'image', status: post.status, imageUrl: '', sourceUrl: post.sourceUrl || '', sourceName: post.sourceName || '', readingTime: 3 });
    setShowModal(true);
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setCategoryError('');
    setCategorySaving(true);
    try {
      const result = await categoryService.createCategory(newCategoryName);
      setCategories(result.categories || [...categories, result.category]);
      setNewCategoryName('');
      setNewPost((post) => ({ ...post, category: result.category }));
    } catch (err) {
      setCategoryError(getErrorMessage(err));
    } finally {
      setCategorySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
          <p className="text-sm text-muted">Manage posts, content status, and view platform metrics</p>
        </div>
        <button
          onClick={() => { setEditingPost(null); setSelectedFiles([]); setNewPost({ title: '', summary: '', takeaway: '', category: CATEGORIES[0], contentType: 'image', status: 'published', imageUrl: '', sourceUrl: '', sourceName: '', readingTime: 3 }); setShowModal(true); }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle size={18} />
          Create Post
        </button>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-muted mb-1 text-xs font-medium">
              <FileText size={15} /> Posts
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalPosts ?? 0}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-forest-600 mb-1 text-xs font-medium">
              <Eye size={15} /> Published
            </div>
            <p className="text-2xl font-bold text-ink">{stats.publishedPosts ?? 0}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1 text-xs font-medium">
              <EyeOff size={15} /> Drafts
            </div>
            <p className="text-2xl font-bold text-ink">{stats.draftPosts ?? 0}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-muted mb-1 text-xs font-medium">
              <Users size={15} /> Users
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalUsers ?? 0}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-rose-500 mb-1 text-xs font-medium">
              <Heart size={15} /> Likes
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalLikes ?? 0}</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1 text-xs font-medium">
              <MessageCircle size={15} /> Comments
            </div>
            <p className="text-2xl font-bold text-ink">{stats.totalComments ?? 0}</p>
          </div>
        </div>
      )}

      <section className="card p-5 mb-6" aria-labelledby="categories-heading">
        <div className="mb-3"><h2 id="categories-heading" className="font-semibold text-ink">Manage categories</h2><p className="text-xs text-muted mt-1">New topics appear in post forms, onboarding, and Explore.</p></div>
        {categoryError && <p role="alert" className="mb-3 text-sm text-red-700">{categoryError}</p>}
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-2">
          <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} required minLength={2} maxLength={40} placeholder="e.g. Marine Biology" aria-label="New category name" className="input flex-1" />
          <button type="submit" disabled={categorySaving} className="btn-primary">{categorySaving ? 'Adding…' : 'Add category'}</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="badge bg-sage/60 text-ink">{category}</span>)}</div>
      </section>

      {/* Posts Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-sage flex items-center justify-between">
          <h2 className="font-semibold text-ink">All Posts ({posts.length})</h2>
          <button onClick={fetchData} className="btn-ghost text-xs flex items-center gap-1">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div className="divide-y divide-sage overflow-x-auto">
          {posts.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No posts available.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="p-4 flex items-center justify-between gap-4 hover:bg-forest-50/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <Link to={`/posts/${post._id}`} className="font-semibold text-sm text-ink hover:text-forest-900 line-clamp-1">
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted mt-1">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span className="capitalize">{post.contentType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`badge text-[11px] ${
                      post.status === 'published'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {post.status}
                  </span>

                  <button onClick={() => openEditPost(post)} className="btn-ghost text-xs">Edit</button>

                  <button
                    onClick={() => handleToggleStatus(post)}
                    className="btn-icon text-muted hover:text-ink"
                    title={post.status === 'published' ? 'Unpublish to draft' : 'Publish post'}
                    aria-label="Toggle publish"
                  >
                    {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="btn-icon text-muted hover:text-red-600 hover:bg-red-50"
                    title="Delete post"
                    aria-label="Delete post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sage">
              <h3 className="font-bold text-lg text-ink">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
                {modalError}
              </p>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Enter a compelling title"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost((p) => ({ ...p, category: e.target.value }))}
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={newPost.contentType}
                    onChange={(e) => { setSelectedFiles([]); setNewPost((p) => ({ ...p, contentType: e.target.value, imageUrl: '' })); }}
                    className="input"
                  >
                    <option value="image">Photo</option>
                    <option value="carousel">Carousel</option>
                    <option value="video">Video Reel</option>
                    <option value="text">Text post</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={newPost.status}
                    onChange={(e) => setNewPost((p) => ({ ...p, status: e.target.value }))}
                    className="input"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Summary / Core Content</label>
                <textarea
                  rows={4}
                  required
                  value={newPost.summary}
                  onChange={(e) => setNewPost((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="Write the interesting summary or body content..."
                  className="input textarea"
                />
              </div>

              <div>
                <label className="label">Key Takeaway</label>
                <input
                  type="text"
                  value={newPost.takeaway}
                  onChange={(e) => setNewPost((p) => ({ ...p, takeaway: e.target.value }))}
                  placeholder="Single sentence key insight or fact"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="label">Source name</label><input value={newPost.sourceName} onChange={(e) => setNewPost((p) => ({ ...p, sourceName: e.target.value }))} placeholder="e.g. NASA" className="input" /></div>
                <div><label className="label">Source URL</label><input type="url" value={newPost.sourceUrl} onChange={(e) => setNewPost((p) => ({ ...p, sourceUrl: e.target.value }))} placeholder="https://…" className="input" /></div>
              </div>

              {newPost.contentType !== 'text' && <div>
                <label className="label">Media {newPost.contentType === 'video' ? '(MP4, WebM or MOV)' : '(images)'}</label>
                <input type="file" accept={newPost.contentType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'} multiple={newPost.contentType === 'carousel'} className="input" onChange={(e) => { const files = Array.from(e.target.files || []); const max = newPost.contentType === 'carousel' ? 8 : 1; setSelectedFiles(files.slice(0, max)); }} />
                {selectedFiles.length > 0 && <div className="mt-3 grid grid-cols-4 gap-2">{selectedFiles.map((file, index) => <div key={`${file.name}-${index}`} className="relative"><div className="aspect-square overflow-hidden rounded-lg bg-ink/5">{file.type.startsWith('video/') ? <video src={URL.createObjectURL(file)} className="h-full w-full object-cover" muted /> : <img src={URL.createObjectURL(file)} alt={`Selected media ${index + 1}`} className="h-full w-full object-cover" />}</div><div className="absolute right-1 top-1 flex gap-1"><button type="button" aria-label={`Move media ${index + 1} left`} disabled={!index} className="rounded-full bg-white p-1 disabled:opacity-40" onClick={() => setSelectedFiles((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>‹</button><button type="button" aria-label={`Remove media ${index + 1}`} className="rounded-full bg-white p-1" onClick={() => setSelectedFiles((items) => items.filter((_, i) => i !== index))}><X size={13} /></button><button type="button" aria-label={`Move media ${index + 1} right`} disabled={index === selectedFiles.length - 1} className="rounded-full bg-white p-1 disabled:opacity-40" onClick={() => setSelectedFiles((items) => { const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}>›</button></div></div>)}</div>}
                {newPost.contentType === 'image' || newPost.contentType === 'video' ? <p className="mt-1 text-xs text-muted">Or use an existing hosted URL:</p> : null}
                {(newPost.contentType === 'image' || newPost.contentType === 'video') && <input type="url" value={newPost.imageUrl} onChange={(e) => setNewPost((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://…" className="input mt-2" />}
              </div>}

              <div className="flex justify-end gap-3 pt-3 border-t border-sage">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingPost ? 'Save Changes' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

