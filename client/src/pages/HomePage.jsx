import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RefreshCw, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { feedService } from '../services/index.js';
import { PostCard } from '../components/post/PostCard.jsx';
import { SkeletonPost } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import { RightSidebar } from '../components/layout/RightSidebar.jsx';

const FeedTab = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
      active
        ? 'bg-forest-900 text-white shadow-sm'
        : 'text-muted hover:text-ink hover:bg-sage/60'
    }`}
  >
    {children}
  </button>
);

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchFeed = useCallback(async (tab, pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const fetchFn = tab === 'following' ? feedService.getFollowing : feedService.getForYou;
      const data = await fetchFn({ page: pageNum, limit: 10 });

      if (pageNum === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setHasMore(data.hasMore ?? false);

      // Fetch trending on first load
      if (pageNum === 1) {
        feedService.getExplore({ limit: 5 }).then(d => setTrendingPosts(d.trending || [])).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    fetchFeed(activeTab, 1);
  }, [activeTab, fetchFeed]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchFeed(activeTab, nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, activeTab, fetchFeed]);

  const handleAuthRequired = () => navigate('/login');

  return (
    <div className="flex gap-6 page-container py-5">
      {/* Main Feed */}
      <div className="flex-1 min-w-0">
        {/* Feed Tabs */}
        <div className="flex items-center gap-2 mb-5">
          <FeedTab active={activeTab === 'for-you'} onClick={() => setActiveTab('for-you')}>
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} />
              For You
            </span>
          </FeedTab>
          {isAuthenticated && (
            <FeedTab active={activeTab === 'following'} onClick={() => setActiveTab('following')}>
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                Following
              </span>
            </FeedTab>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="text-sm text-muted hover:text-ink flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-sage/60 transition-all">
              <Users size={14} />
              Following
            </Link>
          )}
          <button
            onClick={() => fetchFeed(activeTab, 1)}
            className="ml-auto btn-icon"
            aria-label="Refresh feed"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Welcome banner for non-authenticated */}
        {!isAuthenticated && (
          <div className="bg-brand-gradient rounded-2xl p-5 mb-5 text-white animate-fade-in">
            <h1 className="font-bold text-lg mb-1">Welcome to Curio ✨</h1>
            <p className="text-sm text-white/80 mb-4">
              Discover fascinating ideas across science, technology, cinema, history, and more.
            </p>
            <div className="flex gap-2">
              <Link to="/register" className="bg-white text-forest-900 hover:bg-offwhite btn text-sm px-4 py-2 rounded-xl font-semibold">
                Join free
              </Link>
              <Link to="/login" className="border border-white/30 hover:bg-white/10 btn text-white text-sm px-4 py-2 rounded-xl">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* Feed Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonPost key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchFeed(activeTab, 1)} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={activeTab === 'following' ? '👥' : '✨'}
            title={activeTab === 'following' ? 'No posts from people you follow yet' : 'Feed is loading...'}
            description={
              activeTab === 'following'
                ? 'Follow some interesting people to see their posts here.'
                : 'Check back soon – our editorial team publishes new discoveries daily.'
            }
            action={() => navigate('/explore')}
            actionLabel="Explore content"
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onAuthRequired={handleAuthRequired}
              />
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <div className="w-4 h-4 border-2 border-sage border-t-forest-600 rounded-full animate-spin" />
                  Loading more...
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-xs text-muted py-4">You're all caught up! ✨</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <RightSidebar trendingPosts={trendingPosts} />
    </div>
  );
};

export default HomePage;

