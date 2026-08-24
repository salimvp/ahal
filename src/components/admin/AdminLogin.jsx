import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SSMOLogo from '../SSMOLogo';
import Button from '../ui/Button';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/announcements');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 relative text-ink-light">
      {/* Back Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-ink-light-muted hover:text-white bg-dark-surface px-3.5 py-2 rounded-md border border-dark-border transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Public Portal
        </Link>
      </div>

      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-xl p-8 sm:p-10 shadow-dark-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <SSMOLogo className="w-16 h-16" />
          <h2 className="text-xl font-bold font-sans text-white">Administrative Portal</h2>
          <p className="text-xs text-ink-light-muted">
            SSMO Teacher Training Institute, Tirurangadi
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light-muted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border rounded-md text-xs sm:text-sm text-white focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                placeholder="Username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-light-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark border border-dark-border rounded-md text-xs sm:text-sm text-white focus:outline-none focus:border-accent-light focus:ring-1 focus:ring-accent-light transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="p-3 rounded-md bg-dark border border-dark-border text-[11px] text-ink-light-muted">
            <div className="font-semibold text-ink-light-secondary">Default Credentials:</div>
            <div className="mt-1 flex items-center justify-between font-mono text-xs">
              <span>admin</span>
              <span className="text-accent-light">ssmo@admin2026</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="darkPrimary"
            size="md"
            className="w-full"
            loading={loading}
            iconComponent={Shield}
          >
            Authenticate & Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
