import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Bookmark, Share2, Repeat2,
  ChevronLeft, ChevronRight, ExternalLink, Lightbulb,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { postService } from '../../services/index.js';
import { CategoryBadge } from '../ui/CategoryBadge.jsx';
import { formatCount, formatRelativeTime, getErrorMessage } from '../../utils/index.js';

const CarouselMedia = ({ mediaItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const hasMultiple = mediaItems.length > 1;

  const prev = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrentIndex((i) => Math.min(mediaItems.length - 1, i + 1));
  };

  const item = mediaItems[currentIndex];
  if (!item) return null;

  return (
    <div className="relative w-full bg-ink/5 rounded-xl overflow-hidden select-none" onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={(event) => { if (touchStart === null) return; const delta = event.changedTouches[0].clientX - touchStart; if (Math.abs(delta) > 45) setCurrentIndex((i) => Math.max(0, Math.min(mediaItems.length - 1, i + (delta < 0 ? 1 : -1)))); setTouchStart(null); }}>
      {item.type === 'video' ? (
        <video
          src={item.url}
          className="w-full max-h-[420px] object-contain"
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={item.url}
          alt={item.alt || 'Post image'}
          className="w-full max-h-[420px] object-contain"
          loading="lazy"
        />
      )}

      {/* Caption overlay */}
      {item.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <p className="text-white text-sm">{item.caption}</p>
        </div>
      )}

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center
                       disabled:opacity-30 hover:scale-110 transition-transform shadow-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            disabled={currentIndex === mediaItems.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full glass flex items-center justify-center
                       disabled:opacity-30 hover:scale-110 transition-transform shadow-sm"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Slide dots */}
      {hasMultiple && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {mediaItems.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter badge */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {currentIndex + 1}/{mediaItems.length}
        </div>
      )}
    </div>
  );
};

const TakeawayBlock = ({ takeaway }) => {
  if (!takeaway) return null;
  return (
    <div className="bg-forest-50 border border-forest-100 rounded-xl px-4 py-3 flex gap-3">
      <Lightbulb size={16} className="text-forest-700 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-forest-700 uppercase tracking-wide mb-0.5">Worth knowing</p>
        <p className="text-sm text-forest-900 leading-relaxed">{takeaway}</p>
      </div>
    </div>
  );
};

export const PostCard = ({ post: initialPost, onAuthRequired, compact = false }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showTakeaway, setShowTakeaway] = useState(!compact);

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return false;
    }
    return true;
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const wasLiked = post.isLiked;
    setPost(p => ({
      ...p,
      isLiked: !wasLiked,
      likeCount: wasLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1,
    }));

    try {
      if (wasLiked) {
        await postService.unlikePost(post._id);
      } else {
        await postService.likePost(post._id);
      }
    } catch (err) {
      // Revert on failure
      setPost(p => ({
        ...p,
        isLiked: wasLiked,
        likeCount: wasLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1),
      }));
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    if (isSaving) return;

    setIsSaving(true);
    const wasSaved = post.isSaved;
    setPost(p => ({ ...p, isSaved: !wasSaved }));

    try {
      if (wasSaved) {
        await postService.unsavePost(post._id);
      } else {
        await postService.savePost(post._id);
      }
    } catch (err) {
      setPost(p => ({ ...p, isSaved: wasSaved }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    if (isReposting) return;

    setIsReposting(true);
    const wasReposted = post.isReposted;
    setPost(p => ({
      ...p,
      isReposted: !wasReposted,
      repostCount: wasReposted ? Math.max(0, p.repostCount - 1) : p.repostCount + 1,
    }));

    try {
      if (wasReposted) {
        await postService.unrepost(post._id);
      } else {
        await postService.repost(post._id);
      }
    } catch (err) {
      setPost(p => ({
        ...p,
        isReposted: wasReposted,
        repostCount: wasReposted ? p.repostCount + 1 : Math.max(0, p.repostCount - 1),
      }));
    } finally {
      setIsReposting(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
      } catch (err) {
        if (err.name !== 'AbortError') await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const captionIsLong = post.caption && post.caption.length > 180;
  const displayCaption = compact || (!expanded && captionIsLong)
    ? post.caption?.slice(0, 180) + '…'
    : post.caption;

  const hasMedia = post.mediaItems && post.mediaItems.length > 0;

  return (
    <article className="card-hover animate-fade-in" id={`post-${post._id}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to={`/profile/${post.author?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <img
                src={post.author?.avatarUrl || '/placeholder-avatar.png'}
                alt={post.author?.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-sage/60 hover:ring-forest-300 transition-all"
                loading="lazy"
              />
            </Link>
            <div className="min-w-0">
              <Link
                to={`/profile/${post.author?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-sm text-ink hover:text-forest-900 transition-colors block truncate"
              >
                {post.author?.displayName || 'Curio Editorial'}
              </Link>
              <p className="text-xs text-muted">{formatRelativeTime(post.publishedAt)}</p>
            </div>
          </div>
          <CategoryBadge category={post.category} size="xs" />
        </div>

        {/* Title */}
        <Link to={`/posts/${post._id}`}>
          <h2 className={`font-bold text-ink mb-2 leading-snug hover:text-forest-900 transition-colors ${
            compact ? 'text-sm line-clamp-2' : 'text-base'
          }`}>
            {post.title}
          </h2>
        </Link>

        {/* Media */}
        {hasMedia && !compact && (
          <div className="mb-3">
            <CarouselMedia mediaItems={post.mediaItems} />
          </div>
        )}

        {hasMedia && compact && (
          <Link to={`/posts/${post._id}`} className="block mb-3">
            <img
              src={post.mediaItems[0].url}
              alt={post.mediaItems[0].alt || post.title}
              className="w-full h-36 object-cover rounded-xl"
              loading="lazy"
            />
          </Link>
        )}

        {/* Caption */}
        {!compact && post.caption && (
          <div className="mb-3">
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">
              {displayCaption}
            </p>
            {captionIsLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-semibold text-forest-700 hover:text-forest-900 mt-1"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Takeaway */}
        {!compact && post.takeaway && showTakeaway && (
          <div className="mb-3">
            <TakeawayBlock takeaway={post.takeaway} />
          </div>
        )}

        {/* Source */}
        {!compact && post.sourceUrl && (
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-forest-700 transition-colors mb-3"
          >
            <ExternalLink size={11} />
            {post.sourceName || 'Source'}
          </a>
        )}

        {/* Tags */}
        {!compact && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted bg-sage/40 hover:bg-sage px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-sage/60">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`post-action ${post.isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
              aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart
                size={17}
                className={`transition-transform ${isLiking ? 'scale-110' : ''}`}
                fill={post.isLiked ? 'currentColor' : 'none'}
              />
              <span>{formatCount(post.likeCount)}</span>
            </button>

            <Link
              to={`/posts/${post._id}#comments`}
              onClick={(e) => e.stopPropagation()}
              className="post-action"
              aria-label="View comments"
            >
              <MessageCircle size={17} />
              <span>{formatCount(post.commentCount)}</span>
            </Link>

            <button
              onClick={handleRepost}
              disabled={isReposting}
              className={`post-action ${post.isReposted ? 'text-forest-700' : ''}`}
              aria-label={post.isReposted ? 'Remove repost' : 'Repost'}
            >
              <Repeat2 size={17} fill={post.isReposted ? 'currentColor' : 'none'} />
              <span>{formatCount(post.repostCount)}</span>
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleShare}
              className="post-action"
              aria-label="Share post"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`post-action ${post.isSaved ? 'text-forest-900' : ''}`}
              aria-label={post.isSaved ? 'Remove from saved' : 'Save post'}
            >
              <Bookmark
                size={17}
                fill={post.isSaved ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
