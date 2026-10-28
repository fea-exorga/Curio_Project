import { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Share2, Repeat2, MessageCircle, Volume2, VolumeX, Play, Pause, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { postService } from '../../services/index.js';
import { CategoryBadge } from '../ui/CategoryBadge.jsx';
import { formatCount, formatRelativeTime } from '../../utils/index.js';

export const ReelCard = ({ post: initialPost, isActive, onAuthRequired }) => {
  const { isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const [post, setPost] = useState(initialPost);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);

  const videoUrl = post.mediaItems?.[0]?.url;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { onAuthRequired?.(); return; }
    if (isLiking) return;
    setIsLiking(true);
    const wasLiked = post.isLiked;
    setPost(p => ({ ...p, isLiked: !wasLiked, likeCount: wasLiked ? Math.max(0, p.likeCount - 1) : p.likeCount + 1 }));
    try {
      wasLiked ? await postService.unlikePost(post._id) : await postService.likePost(post._id);
    } catch {
      setPost(p => ({ ...p, isLiked: wasLiked, likeCount: wasLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1) }));
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { onAuthRequired?.(); return; }
    if (isSaving) return;
    setIsSaving(true);
    const wasSaved = post.isSaved;
    setPost(p => ({ ...p, isSaved: !wasSaved }));
    try {
      wasSaved ? await postService.unsavePost(post._id) : await postService.savePost(post._id);
    } catch {
      setPost(p => ({ ...p, isSaved: wasSaved }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div
      className="relative w-full h-full bg-ink overflow-hidden select-none"
      onClick={togglePlay}
    >
      {/* Video */}
      {videoUrl && !mediaFailed ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted={isMuted}
          playsInline
          preload="metadata"
          aria-label={post.title}
          onTimeUpdate={(event) => { const video = event.currentTarget; setProgress(video.duration ? video.currentTime / video.duration : 0); }}
          onEnded={() => setIsPlaying(false)}
          onError={() => setMediaFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-forest-900 flex items-center justify-center">
          <div className="text-white/70 text-sm">{videoUrl ? 'This video cannot be played.' : 'Video unavailable'}</div>
        </div>
      )}

      <div className="absolute top-0 inset-x-0 h-1 bg-white/25 z-10" aria-label="Video progress"><div className="h-full bg-white transition-[width]" style={{ width: `${progress * 100}%` }} /></div>

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Play size={28} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={toggleMute}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Post info"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Right side actions */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-5 items-center">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group" aria-label="Like">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all
            ${post.isLiked ? 'bg-red-500' : 'bg-black/40 backdrop-blur-sm group-hover:bg-black/60'}`}
          >
            <Heart size={20} className="text-white" fill={post.isLiked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(post.likeCount)}</span>
        </button>

        <Link to={`/posts/${post._id}#comments`} onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1 group">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-all">
            <MessageCircle size={20} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(post.commentCount)}</span>
        </Link>

        <button onClick={handleSave} className="flex flex-col items-center gap-1 group" aria-label="Save">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all
            ${post.isSaved ? 'bg-forest-700' : 'bg-black/40 backdrop-blur-sm group-hover:bg-black/60'}`}
          >
            <Bookmark size={20} className="text-white" fill={post.isSaved ? 'currentColor' : 'none'} />
          </div>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group" aria-label="Share">
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-all">
            <Share2 size={18} className="text-white" />
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-14 p-4 pb-6">
        <Link to={`/profile/${post.author?.username}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 mb-2">
          <img src={post.author?.avatarUrl} alt={post.author?.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/40" loading="lazy" />
          <span className="text-white font-semibold text-sm">{post.author?.displayName}</span>
        </Link>
        <h3 className="text-white font-bold text-base leading-tight mb-1.5 line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2">
          <CategoryBadge category={post.category} size="xs" />
          <span className="text-white/60 text-xs">{formatRelativeTime(post.publishedAt)}</span>
        </div>

        {/* Info panel */}
        {showInfo && post.caption && (
          <div className="mt-3 bg-black/60 backdrop-blur-sm rounded-xl p-3 animate-slide-up">
            <p className="text-white/90 text-sm leading-relaxed line-clamp-4">{post.caption}</p>
            {post.takeaway && (
              <p className="text-forest-300 text-xs mt-2 font-medium">💡 {post.takeaway}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
