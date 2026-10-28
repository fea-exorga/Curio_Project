import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, FolderPlus, Folder, X } from 'lucide-react';
import { savedService } from '../services/index.js';
import { PostCard } from '../components/post/PostCard.jsx';
import { SkeletonPost } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import { getErrorMessage } from '../utils/index.js';

export const SavedPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [movingPostId, setMovingPostId] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedCollection === 'all' ? {} : { collectionId: selectedCollection };
      const [savedData, collectionData] = await Promise.all([
        savedService.getSaved(params),
        savedService.getCollections(),
      ]);
      setPosts(savedData.posts || []);
      setCollections(collectionData.collections || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCollection]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const handleCreateCollection = async (event) => {
    event.preventDefault();
    setCreating(true);
    setActionError('');
    try {
      const { collection } = await savedService.createCollection({ name: collectionName, description: collectionDescription });
      setCollections((items) => [{ ...collection, postCount: 0 }, ...items]);
      setCollectionName('');
      setCollectionDescription('');
      setShowCreate(false);
      setSelectedCollection(collection._id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally { setCreating(false); }
  };

  const movePost = async (post, nextCollectionId) => {
    setMovingPostId(post._id);
    setActionError('');
    try {
      if (nextCollectionId) await savedService.addPostToCollection(nextCollectionId, post._id);
      else if (post.savedCollectionId) await savedService.removePostFromCollection(post.savedCollectionId, post._id);
      await fetchSaved();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally { setMovingPostId(''); }
  };

  const selectedName = collections.find((collection) => collection._id === selectedCollection)?.name;

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-sage">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-900"><Bookmark size={20} /></div>
          <div>
            <h1 className="text-xl font-bold text-ink">Saved Posts</h1>
            <p className="text-xs text-muted">{posts.length} saved {posts.length === 1 ? 'post' : 'posts'}{selectedName ? ` in ${selectedName}` : ''}</p>
          </div>
        </div>
        <button type="button" onClick={() => { setActionError(''); setShowCreate((value) => !value); }} className="btn-primary"><FolderPlus size={16} /> New collection</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateCollection} className="card mb-5 p-4 space-y-3" aria-label="Create a saved-post collection">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-ink">Create collection</h2><button type="button" onClick={() => setShowCreate(false)} className="btn-icon" aria-label="Close"><X size={17} /></button></div>
          <label className="block"><span className="label">Name</span><input autoFocus required maxLength={60} value={collectionName} onChange={(event) => setCollectionName(event.target.value)} className="input" placeholder="e.g. Ideas to revisit" /></label>
          <label className="block"><span className="label">Description <span className="font-normal text-muted">(optional)</span></span><input maxLength={200} value={collectionDescription} onChange={(event) => setCollectionDescription(event.target.value)} className="input" placeholder="What are you collecting?" /></label>
          {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button><button disabled={creating} type="submit" className="btn-primary">{creating ? 'Creating…' : 'Create collection'}</button></div>
        </form>
      )}

      {actionError && !showCreate && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide" aria-label="Saved post collections">
        <button type="button" onClick={() => setSelectedCollection('all')} className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium ${selectedCollection === 'all' ? 'border-forest-900 bg-forest-900 text-white' : 'border-sage bg-white text-muted'}`}>All saved</button>
        {collections.map((collection) => (
          <button key={collection._id} type="button" onClick={() => setSelectedCollection(collection._id)} className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${selectedCollection === collection._id ? 'border-forest-900 bg-forest-900 text-white' : 'border-sage bg-white text-muted'}`}>
            <Folder size={15} />{collection.name}<span className="opacity-70">{collection.postCount ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4"><SkeletonPost /><SkeletonPost /><SkeletonPost /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSaved} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={selectedCollection === 'all' ? '🔖' : '📂'}
          title={selectedCollection === 'all' ? 'Nothing saved yet' : 'This collection is empty'}
          description={selectedCollection === 'all' ? 'Tap the bookmark icon on any post to save it here for later reading.' : 'Choose All saved to move posts into this collection.'}
          action={selectedCollection === 'all' ? () => navigate('/') : () => setSelectedCollection('all')}
          actionLabel={selectedCollection === 'all' ? 'Explore posts' : 'Browse saved posts'}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id}>
              <div className="mb-2 flex justify-end">
                <label className="flex items-center gap-2 text-xs text-muted">
                  <span>Collection</span>
                  <select aria-label={`Move ${post.title} to a collection`} disabled={movingPostId === post._id} value={post.savedCollectionId || ''} onChange={(event) => movePost(post, event.target.value)} className="rounded-lg border border-sage bg-white px-2 py-1.5 text-ink">
                    <option value="">Unfiled</option>
                    {collections.map((collection) => <option key={collection._id} value={collection._id}>{collection.name}</option>)}
                  </select>
                </label>
              </div>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
