import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/index.js';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const { displayName, username, email, password } = formData;

    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please provide display name, username, email, and password.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await register({
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });

      // If user has no interests configured yet, route to onboarding
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
      {/* Left – decorative brand column */}
      <div className="hidden lg:flex flex-1 bg-brand-gradient flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-white font-bold text-2xl">Curio</span>
        </Link>
        <div>
          <blockquote className="text-white/90 text-xl font-light leading-relaxed mb-4">
            "Curiosity is the engine of achievement. Learn, question, and discover something new every day."
          </blockquote>
          <p className="text-white/60 text-sm">— Ken Robinson</p>
        </div>
        <p className="text-white/50 text-sm">A little more interesting, every day.</p>
      </div>

      {/* Right – registration form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-ink">Curio</span>
          </Link>

          <h1 className="text-2xl font-bold text-ink mb-1">Create an account</h1>
          <p className="text-muted text-sm mb-8">Join Curio to start discovering ideas.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-displayname" className="label">
                Display name
              </label>
              <input
                id="register-displayname"
                type="text"
                disabled={loading}
                value={formData.displayName}
                onChange={(e) => setFormData((d) => ({ ...d, displayName: e.target.value }))}
                placeholder="e.g. Ada Lovelace"
                className="input"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="register-username" className="label">
                Username
              </label>
              <input
                id="register-username"
                type="text"
                disabled={loading}
                value={formData.username}
                onChange={(e) => setFormData((d) => ({ ...d, username: e.target.value }))}
                placeholder="e.g. adalovelace"
                className="input"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="label">
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                disabled={loading}
                value={formData.email}
                onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                placeholder="ada@example.com"
                className="input"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
                  placeholder="At least 6 characters"
                  className="input pr-11"
                  autoComplete="new-password"
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
              id="register-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-700 font-semibold hover:text-forest-900 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

