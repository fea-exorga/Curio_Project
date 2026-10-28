import { useState, useEffect, useRef } from 'react';
import { postService } from '../services/index.js';
import { ReelCard } from '../components/post/ReelCard.jsx';
import { SkeletonPost } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import { useNavigate } from 'react-router-dom';

export const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const data = await postService.getReels({ limit: 20 });
        setReels(data.reels || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reels.');
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  // Intersection Observer to detect active reel
  useEffect(() => {
    if (!reels.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index, 10);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 }
    );

    const slides = containerRef.current?.querySelectorAll('[data-index]');
    slides?.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [reels]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <div className="text-white/60 text-sm animate-pulse">Loading reels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <EmptyState
          icon="🎬"
          title="No reels yet"
          description="Short-form video content will appear here. Check back soon!"
          action={() => navigate('/')}
          actionLabel="Browse the feed"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-ink overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map((reel, i) => (
        <div
          key={reel._id}
          data-index={i}
          className="w-full h-dvh snap-start snap-always flex items-center justify-center"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-full max-w-sm h-full relative">
            <ReelCard
              post={reel}
              isActive={i === activeIndex}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelsPage;

