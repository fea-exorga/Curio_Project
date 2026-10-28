import { Link } from 'react-router-dom';
import { TrendingUp, Compass, Sparkles } from 'lucide-react';
import { getCategoryMeta } from '../../utils/index.js';
import { useCategories } from '../../hooks/useCategories.js';

export const RightSidebar = ({ trendingPosts = [] }) => {
  const { categories } = useCategories();
  const categoryShortList = categories.slice(0, 7);
  return (
    <aside className="hidden lg:block w-64 xl:w-72 shrink-0 py-5 space-y-5">
      {/* Category shortcuts */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass size={16} className="text-forest-700" />
          <h2 className="text-sm font-semibold text-ink">Browse by topic</h2>
        </div>
        <div className="space-y-0.5">
          {categoryShortList.map((cat) => {
            const meta = getCategoryMeta(cat);
            return (
              <Link
                key={cat}
                to={`/explore?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-sage/60 transition-colors group"
              >
                <span className="text-base">{meta.emoji}</span>
                <span className="text-sm text-muted group-hover:text-ink transition-colors">{meta.short}</span>
              </Link>
            );
          })}
          <Link
            to="/explore"
            className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-forest-700 hover:text-forest-900 transition-colors mt-1"
          >
            <Sparkles size={14} />
            All topics →
          </Link>
        </div>
      </div>

      {/* Trending */}
      {trendingPosts.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-forest-700" />
            <h2 className="text-sm font-semibold text-ink">Trending</h2>
          </div>
          <div className="space-y-3">
            {trendingPosts.slice(0, 4).map((post, i) => {
              const meta = getCategoryMeta(post.category);
              return (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="flex gap-3 group"
                >
                  <span className="text-xs font-bold text-muted/60 pt-0.5 w-4 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-forest-900 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </p>
                    <span className="text-xs text-muted">{meta.emoji} {meta.short}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Discovery tagline */}
      <div className="px-4 py-3 rounded-2xl bg-brand-gradient text-white">
        <p className="text-sm font-semibold mb-1">A little more interesting,</p>
        <p className="text-sm font-semibold">every day. ✨</p>
        <p className="text-xs text-white/70 mt-2 leading-relaxed">
          Curio serves knowledge worth having, in a format you actually want to read.
        </p>
      </div>
    </aside>
  );
};
