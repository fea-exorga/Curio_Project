import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/index.js';
import { getCategoryMeta, getErrorMessage } from '../utils/index.js';
import { useCategories } from '../hooks/useCategories.js';

export const OnboardingPage = () => {
  const { user, updateUser } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set(user?.interests || []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.updateInterests([...selected]);
      if (data.user) {
        updateUser(data.user);
      }
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-offwhite flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-float">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">What are you curious about?</h1>
          <p className="text-muted text-sm max-w-md mx-auto">
            Choose the topics you'd like to explore. We'll curate your personal discovery feed based on your interests.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-6 text-center animate-fade-in">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat);
            const isSelected = selected.has(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`relative flex items-center gap-3 p-4 rounded-2xl border text-left transition-all duration-200 select-none ${
                  isSelected
                    ? 'border-forest-700 bg-forest-50/80 shadow-sm ring-1 ring-forest-700'
                    : 'border-sage/70 bg-white hover:border-forest-400 hover:shadow-card'
                }`}
              >
                <span className="text-2xl shrink-0" role="img" aria-label={cat}>
                  {meta.emoji}
                </span>
                <span className="text-sm font-semibold text-ink leading-tight flex-1 pr-6">
                  {cat}
                </span>
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-forest-900 flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || selected.size === 0}
            className="btn-primary w-full py-3 text-base justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving interests...
              </span>
            ) : (
              `Continue with ${selected.size} interest${selected.size === 1 ? '' : 's'}`
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-ghost w-full py-2 text-sm justify-center text-muted hover:text-ink"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

