import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Sparkles, UserPlus, UserCheck, Pencil, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { userService, postService } from '../services/index.js';
import { PostCard } from '../components/post/PostCard.jsx';
import { SkeletonProfile } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import { CategoryBadge } from '../components/ui/CategoryBadge.jsx';
import { formatCount, getErrorMessage } from '../utils/index.js';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileForm, setProfileForm] = useState({ displayName: '', bio: '', website: '' });

  const fetchProfileAndPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await userService.getProfile(username);
      const userObj = profileData.user;
      setProfile(userObj);

      if (userObj?._id) {
        const postsData = await postService.getPosts({ author: userObj._id, limit: 30 });
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [fetchProfileAndPosts]);

  const handleToggleFollow = async () => {
    if (!profile || !isAuthenticated || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await userService.unfollowUser(profile._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, (prev.followersCount || 1) - 1),
        }));
      } else {
        await userService.followUser(profile._id);
        setProfile((prev) => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1,
        }));
      }
    } catch (err) {
      // Silently fail or ignore error
    } finally {
      setFollowLoading(false);
    }
  };

  const openEditor = () => {
    setProfileForm({ displayName: profile.displayName || '', bio: profile.bio || '', website: profile.website || '' });
    setAvatarFile(null);
    setAvatarPreview('');
    setProfileError('');
    setEditing(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      let avatarUrl = profile.avatarUrl;
      if (avatarFile) avatarUrl = (await userService.uploadAvatar(avatarFile)).avatarUrl;
      const result = await userService.updateProfile({ ...profileForm, avatarUrl });
      setProfile((previous) => ({ ...previous, ...result.user }));
      updateUser({ ...currentUser, ...result.user });
      setEditing(false);
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-6">
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-12">
        <ErrorState
          message={error || 'User not found.'}
          onRetry={fetchProfileAndPosts}
        />
      </div>
    );
  }

  const isSelf = profile.isSelf || currentUser?._id === profile._id;

  return (
    <div className="max-w-[640px] mx-auto px-4 py-6">
      {/* Profile Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-sage shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-ink truncate leading-tight">
                {profile.displayName}
              </h1>
              <p className="text-sm text-muted truncate">@{profile.username}</p>
            </div>
          </div>

          {isSelf && isAuthenticated ? (
            <button onClick={openEditor} className="btn-secondary shrink-0" type="button"><Pencil size={15} /> Edit Profile</button>
          ) : !isSelf && isAuthenticated && (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`btn shrink-0 ${
                profile.isFollowing ? 'btn-secondary' : 'btn-primary'
              }`}
            >
              {profile.isFollowing ? (
                <>
                  <UserCheck size={16} />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-ink/80 leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        )}
        {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-forest-800 hover:underline">{profile.website.replace(/^https?:\/\//, '')}</a>}

        {/* Stats Row */}
        <div className="flex gap-6 mt-5 pt-4 border-t border-sage text-sm">
          <div>
            <span className="font-bold text-ink">{formatCount(profile.postCount ?? posts.length)}</span>{' '}
            <span className="text-muted">posts</span>
          </div>
          <div>
            <span className="font-bold text-ink">{formatCount(profile.followersCount ?? 0)}</span>{' '}
            <span className="text-muted">followers</span>
          </div>
          <div>
            <span className="font-bold text-ink">{formatCount(profile.followingCount ?? 0)}</span>{' '}
            <span className="text-muted">following</span>
          </div>
        </div>

        {/* User Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-4 pt-3 flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <CategoryBadge key={interest} category={interest} size="sm" />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <form onSubmit={saveProfile} className="card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" aria-labelledby="edit-profile-title">
            <div className="flex items-center justify-between"><h2 id="edit-profile-title" className="text-lg font-bold">Edit profile</h2><button type="button" onClick={() => setEditing(false)} className="btn-icon" aria-label="Close"><X size={18} /></button></div>
            {profileError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
            <div className="flex items-center gap-4">
              <img src={avatarPreview || profile.avatarUrl} alt="Profile preview" className="h-16 w-16 rounded-full object-cover" />
              <label className="btn-secondary cursor-pointer">Change photo<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { setProfileError('Choose an image smaller than 5 MB.'); return; } setProfileError(''); setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }} /></label>
              <span className="text-xs text-muted">JPEG, PNG, WebP or GIF · up to 5 MB</span>
            </div>
            <label className="block"><span className="label">Display name</span><input required maxLength={50} className="input" value={profileForm.displayName} onChange={(event) => setProfileForm((form) => ({ ...form, displayName: event.target.value }))} /></label>
            <label className="block"><span className="label">Bio</span><textarea rows={3} maxLength={280} className="input textarea" value={profileForm.bio} onChange={(event) => setProfileForm((form) => ({ ...form, bio: event.target.value }))} /></label>
            <label className="block"><span className="label">Website</span><input type="url" className="input" placeholder="https://example.com" value={profileForm.website} onChange={(event) => setProfileForm((form) => ({ ...form, website: event.target.value }))} /></label>
            <div className="flex justify-end gap-2 border-t border-sage pt-4"><button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button><button disabled={savingProfile} className="btn-primary" type="submit">{savingProfile ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </div>
      )}

      {/* User Posts Section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-ink px-1">Posts</h2>
        {posts.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No posts published yet"
            description={
              isSelf
                ? 'Your published discoveries and posts will appear here.'
                : `@${profile.username} hasn't published any posts yet.`
            }
          />
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

