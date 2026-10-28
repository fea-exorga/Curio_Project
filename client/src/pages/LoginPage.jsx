import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/index.js';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.login.trim() || !formData.password) {
      setError('Please enter your username/email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(formData);
      // If user has no interests, go to onboarding
      if (!data.user?.interests?.length) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex bg-offwhite">
      {/* Left – decorative */}
      <div className="hidden lg:flex flex-1 bg-brand-gradient flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-white font-bold text-2xl">Curio</span>
        </Link>
        <div>
          <blockquote className="text-white/90 text-xl font-light leading-relaxed mb-4">
            "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
          </blockquote>
          <p className="text-white/60 text-sm">— Dr. Seuss</p>
        </div>
        <p className="text-white/50 text-sm">A little more interesting, every day.</p>
      </div>

      {/* Right – form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-ink">Curio</span>
          </Link>

          <h1 className="text-2xl font-bold text-ink mb-1">Welcome back</h1>
          <p className="text-muted text-sm mb-8">Sign in to continue discovering.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-input" className="label">Username or email</label>
              <input
                id="login-input"
                type="text"
                value={formData.login}
                onChange={(e) => setFormData(d => ({ ...d, login: e.target.value }))}
                placeholder="username or email@example.com"
                className="input"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password-input" className="label">Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(d => ({ ...d, password: e.target.value }))}
                  placeholder="Your password"
                  className="input pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base"
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-700 font-semibold hover:text-forest-900 transition-colors">
              Join Curio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

