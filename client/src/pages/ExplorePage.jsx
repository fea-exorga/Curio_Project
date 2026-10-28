import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, X, Compass, TrendingUp, Grid, UserPlus, UserCheck, Users } from 'lucide-react';
import { feedService, userService } from '../services/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PostCard } from '../components/post/PostCard.jsx';
import { SkeletonGrid } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import { CategoryBadge } from '../components/ui/CategoryBadge.jsx';
import { getCategoryMeta } from '../utils/index.js';
import { useCategories } from '../hooks/useCategories.js';

export const ExplorePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchingProfiles, setSearchingProfiles] = useState(false);
  const [followingAction, setFollowingAction] = useState('');
  const [profileActionError, setProfileActionError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  const fetchExplore = useCallback(async (q, cat) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q) params.q = q;
      if (cat) params.category = cat;
      const data = await feedService.getExplore(params);
      setPosts(data.posts || []);
      if (!q && !cat) setTrending(data.trending || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchExplore(query, category);
      if (query.trim().length >= 2) {
        setSearchingProfiles(true);
        userService.searchProfiles(query.trim())
          .then((data) => { if (!cancelled) setProfiles(data.users || []); })
          .catch(() => { if (!cancelled) setProfiles([]); })
          .finally(() => { if (!cancelled) setSearchingProfiles(false); });
      } else {
        setProfiles([]);
        setSearchingProfiles(false);
      }
      // Sync to URL
      const params = {};
      if (query) params.q = query;
      if (category) params.category = category;
      setSearchParams(params, { replace: true });
    }, 350);

    return () => { cancelled = true; clearTimeout(debounceRef.current); };
  }, [query, category, fetchExplore, setSearchParams]);

  const clearSearch = () => {
    setQuery('');
    setCategory('');
  };

  const toggleFollow = async (profile) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (followingAction) return;
    setFollowingAction(profile._id);
    setProfileActionError('');
    try {
      if (profile.isFollowing) {
        await userService.unfollowUser(profile._id);
        setProfiles((items) => items.map((item) => item._id === profile._id ? { ...item, isFollowing: false, followersCount: Math.max(0, (item.followersCount || 1) - 1) } : item));
      } else {
        await userService.followUser(profile._id);
        setProfiles((items) => items.map((item) => item._id === profile._id ? { ...item, isFollowing: true, followersCount: (item.followersCount || 0) + 1 } : item));
      }
    } catch (err) {
      setProfileActionError(err.response?.data?.message || 'Could not update follow status. Please try again.');
    } finally { setFollowingAction(''); }
  };

  const isFiltered = query || category;

  return (
    <div className="page-container py-5 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
          <Compass size={24} className="text-forest-700" />
          Explore
        </h1>
        <p className="text-sm text-muted">Discover content across every topic Curio covers.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, topics, or people..."
          className="input pl-11 pr-10 py-3 text-base"
          aria-label="Search Curio"
          id="explore-search"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        <button
          onClick={() => setCategory('')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            !category
              ? 'bg-forest-900 text-white border-forest-900'
              : 'bg-white text-muted border-sage hover:border-forest-300 hover:text-ink'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat);
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(isActive ? '' : cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'bg-forest-900 text-white border-forest-900'
                  : 'bg-white text-muted border-sage hover:border-forest-300 hover:text-ink'
              }`}
            >
              <span>{meta.emoji}</span>
              <span>{meta.short}</span>
            </button>
          );
        })}
      </div>

      {query.trim().length >= 2 && (
        <section className="mb-7" aria-labelledby="people-results-heading">
          <div className="mb-3 flex items-center gap-2"><Users size={17} className="text-forest-700" /><h2 id="people-results-heading" className="text-sm font-semibold text-ink">People</h2></div>
          {profileActionError && <p role="alert" className="mb-3 text-sm text-red-700">{profileActionError}</p>}
          {searchingProfiles ? <p className="text-sm text-muted">Searching profiles…</p> : profiles.length === 0 ? <p className="text-sm text-muted">No matching profiles found.</p> : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <div key={profile._id} className="card flex min-w-0 items-center gap-3 p-3">
                <Link to={`/profile/${profile.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <img src={profile.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" loading="lazy" />
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{profile.displayName}</span><span className="block truncate text-xs text-muted">@{profile.username} · {profile.followersCount || 0} followers</span></span>
                </Link>
                <button type="button" onClick={() => toggleFollow(profile)} disabled={followingAction === profile._id} className={profile.isFollowing ? 'btn-secondary shrink-0 px-3 py-2 text-xs' : 'btn-primary shrink-0 px-3 py-2 text-xs'} aria-label={`${profile.isFollowing ? 'Unfollow' : 'Follow'} ${profile.username}`}>
                  {profile.isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending section (shown when no filter) */}
      {!isFiltered && trending.length > 0 && (
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
            <TrendingUp size={16} className="text-forest-700" />
            Trending this week
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trending.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="card-hover flex gap-3 p-3"
              >
                {post.mediaItems?.[0] && (
                  <img
                    src={post.mediaItems[0].url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink line-clamp-2 leading-tight mb-1">{post.title}</p>
                  <CategoryBadge category={post.category} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        {isFiltered && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-ink">
              {loading ? 'Searching...' : `${posts.length} result${posts.length !== 1 ? 's' : ''}`}
              {category && ` in ${getCategoryMeta(category).short}`}
              {query && ` for "${query}"`}
            </h2>
            <button onClick={clearSearch} className="text-xs text-muted hover:text-ink flex items-center gap-1">
              <X size={13} /> Clear filters
            </button>
          </div>
        )}

        {!isFiltered && (
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink mb-4">
            <Grid size={16} className="text-forest-700" />
            All posts
          </h2>
        )}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchExplore(query, category)} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={isFiltered ? 'No results found' : 'No posts yet'}
            description={
              isFiltered
                ? 'Try different search terms or browse by category.'
                : 'Check back soon – content is added regularly.'
            }
            action={isFiltered ? clearSearch : undefined}
            actionLabel={isFiltered ? 'Clear search' : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

