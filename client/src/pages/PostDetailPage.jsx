import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Bookmark, Share2, Repeat2,
  ExternalLink, Lightbulb, ArrowLeft, Send, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { postService } from '../services/index.js';
import { CategoryBadge } from '../components/ui/CategoryBadge.jsx';
import { SkeletonPost } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { formatCount, formatRelativeTime, getErrorMessage } from '../utils/index.js';

const CommentSection = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    postService.getComments(postId)
      .then(data => { if (mounted) { setComments(data.comments || []); setLoading(false); } })
      .catch(err => { if (mounted) { setError(getErrorMessage(err)); setLoading(false); } });
    return () => { mounted = false; };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const data = await postService.addComment(postId, text.trim());
      setComments(prev => [data.comment, ...prev]);
      setText('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await postService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div id="comments" className="pt-4">
      <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
        <MessageCircle size={18} />
        Comments ({comments.length})
      </h2>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-5">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-sage"
          />
          <div className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
              className="input flex-1 text-sm"
              aria-label="Comment text"
            />
            <button
              type="submit"
              disabled={!text.trim() || submitting}
              className="btn-primary px-3 py-2"
              aria-label="Submit comment"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-skeleton">
              <div className="skeleton w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-32 rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwn = user?._id === comment.userId?._id;
            const isAdmin = user?.role === 'admin';
            return (
              <div key={comment._id} className="flex gap-3 group animate-fade-in">
                <Link to={`/profile/${comment.userId?.username}`}>
                  <img
                    src={comment.userId?.avatarUrl}
                    alt={comment.userId?.displayName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-sage shrink-0"
                    loading="lazy"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link to={`/profile/${comment.userId?.username}`} className="text-sm font-semibold text-ink hover:text-forest-900 transition-colors">
                      {comment.userId?.displayName}
                    </Link>
                    <span className="text-xs text-muted">{formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-ink/85 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
                {(isOwn || isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-500 transition-all rounded"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PostDetailPage = () => {
  const { postId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    postService.getPost(postId)
      .then(data => {
        if (!mounted) return;
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
        setIsLiked(data.post.isLiked || false);
        setLikeCount(data.post.likeCount || 0);
        setIsSaved(data.post.isSaved || false);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Post not found or unavailable.');
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [postId]);

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(c => wasLiked ? Math.max(0, c - 1) : c + 1);
    try {
      wasLiked ? await postService.unlikePost(postId) : await postService.likePost(postId);
    } catch {
      setIsLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : Math.max(0, c - 1));
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    try {
      wasSaved ? await postService.unsavePost(postId) : await postService.savePost(postId);
    } catch {
      setIsSaved(wasSaved);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) return (
    <div className="page-container py-5 max-w-2xl">
      <SkeletonPost />
    </div>
  );

  if (error || !post) return (
    <div className="page-container py-5 max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </button>
      <ErrorState message={error} onRetry={() => window.location.reload()} />
    </div>
  );

  const hasMedia = post.mediaItems && post.mediaItems.length > 0;
  const hasMultipleMedia = post.mediaItems?.length > 1;

  return (
    <div className="page-container py-5 max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <article className="card overflow-hidden animate-fade-in mb-6">
        {/* Author */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post.author?.username}`}>
                <img
                  src={post.author?.avatarUrl}
                  alt={post.author?.displayName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-sage hover:ring-forest-300 transition-all"
                />
              </Link>
              <div>
                <Link to={`/profile/${post.author?.username}`} className="font-bold text-ink hover:text-forest-900 transition-colors">
                  {post.author?.displayName}
                </Link>
                <p className="text-xs text-muted">@{post.author?.username} · {formatRelativeTime(post.publishedAt)}</p>
              </div>
            </div>
            <CategoryBadge category={post.category} />
          </div>

          <h1 className="text-xl font-bold text-ink leading-tight mb-3">{post.title}</h1>
        </div>

        {/* Media */}
        {hasMedia && (
          <div className="relative">
            {post.mediaItems[currentMediaIndex]?.type === 'video' ? (
              <video
                src={post.mediaItems[currentMediaIndex].url}
                className="w-full max-h-[500px] object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={post.mediaItems[currentMediaIndex].url}
                alt={post.mediaItems[currentMediaIndex].alt || post.title}
                className="w-full max-h-[500px] object-cover"
              />
            )}

            {hasMultipleMedia && (
              <>
                <button
                  onClick={() => setCurrentMediaIndex(i => Math.max(0, i - 1))}
                  disabled={currentMediaIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMediaIndex(i => Math.min(post.mediaItems.length - 1, i + 1))}
                  disabled={currentMediaIndex === post.mediaItems.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {currentMediaIndex + 1}/{post.mediaItems.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-5">
          {/* Caption */}
          <div className="prose prose-sm max-w-none mb-4">
            <p className="text-ink/85 leading-relaxed whitespace-pre-line text-[15px]">{post.caption}</p>
          </div>

          {/* Takeaway */}
          {post.takeaway && (
            <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 flex gap-3 mb-4">
              <Lightbulb size={16} className="text-forest-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-forest-700 uppercase tracking-wide mb-0.5">Worth knowing</p>
                <p className="text-sm text-forest-900 leading-relaxed">{post.takeaway}</p>
              </div>
            </div>
          )}

          {/* Related topics */}
          {post.relatedTopics?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Explore further</p>
              <div className="flex flex-wrap gap-2">
                {post.relatedTopics.map((topic) => (
                  <Link
                    key={topic}
                    to={`/explore?q=${encodeURIComponent(topic)}`}
                    className="text-sm bg-sage/50 hover:bg-sage text-ink px-3 py-1.5 rounded-xl transition-colors"
                  >
                    {topic} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted bg-sage/40 px-2 py-0.5 rounded-md">#{tag}</span>
              ))}
            </div>
          )}

          {/* Source */}
          {post.sourceUrl && (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-forest-700 transition-colors mb-4 block"
            >
              <ExternalLink size={12} />
              Source: {post.sourceName || 'Read more'}
            </a>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-sage/60">
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`post-action ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{formatCount(likeCount)}</span>
              </button>
              <button className="post-action">
                <MessageCircle size={18} />
                <span>{formatCount(post.commentCount)}</span>
              </button>
              <button onClick={handleShare} className="post-action">
                <Share2 size={17} />
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`post-action ${isSaved ? 'text-forest-900' : ''}`}
            >
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-sage p-5">
          <CommentSection postId={postId} />
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-3">More in {post.category}</h2>
          <div className="space-y-3">
            {relatedPosts.map((rp) => (
              <Link key={rp._id} to={`/posts/${rp._id}`} className="card-hover flex gap-3 p-3">
                {rp.mediaItems?.[0] && (
                  <img src={rp.mediaItems[0].url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy" />
                )}
                <div>
                  <p className="text-sm font-semibold text-ink line-clamp-2 leading-tight">{rp.title}</p>
                  <CategoryBadge category={rp.category} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailPage;

