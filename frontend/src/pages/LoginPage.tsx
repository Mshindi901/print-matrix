import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Printer, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, getApiErrorMessage, persistAuthSession } from '../services/api';

const getRoleFromUser = (user: unknown) => {
  if (!user || typeof user !== 'object') {
    return undefined;
  }

  const candidate = user as Record<string, unknown>;

  if (typeof candidate.role === 'string') {
    return candidate.role.toLowerCase();
  }

  if (typeof candidate.role === 'number') {
    return candidate.role === 1 ? 'admin' : 'user';
  }

  if (Array.isArray(candidate.roles)) {
    const normalizedRoles = candidate.roles
      .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''))
      .filter(Boolean);

    if (normalizedRoles.some((value) => value.includes('admin'))) {
      return 'admin';
    }

    if (normalizedRoles.length > 0) {
      return normalizedRoles[0];
    }
  }

  if (typeof candidate.user_role === 'string') {
    return candidate.user_role.toLowerCase();
  }

  if (typeof candidate.role_name === 'string') {
    return candidate.role_name.toLowerCase();
  }

  if (typeof candidate.isAdmin === 'boolean') {
    return candidate.isAdmin ? 'admin' : 'user';
  }

  return undefined;
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ tone: 'error' | 'success'; message: string } | null>(() => {
    const message = sessionStorage.getItem('authMessage');
    if (message) {
      sessionStorage.removeItem('authMessage');
      return { tone: 'success', message };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!status) {
      return undefined;
    }

    const timer = window.setTimeout(() => setStatus(null), 3000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data.success) {
        let user = response.data.user;

        if(!user && response.data.role){
          user = {role: response.data.role}
        }
        if (!user) {
          try {
            const profileResp = await api.get('/users/profile');
            if (profileResp?.data?.success) {
              user = profileResp.data.user;
            }
          } catch (profileErr) {
            console.warn('Failed to fetch profile after signin:', profileErr);
          }
        }

        persistAuthSession({ ...response.data, user });

        const role = getRoleFromUser(user) || (typeof response.data.role === 'string' ? response.data.role.toLowerCase() : undefined);
        sessionStorage.setItem(
          'authMessage',
          role === 'admin' ? 'Signed in as admin. Redirecting to admin dashboard.' : 'Signed in successfully.',
        );
        navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      setStatus({ tone: 'error', message: getApiErrorMessage(err) || 'Login failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_36%),_#020617] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 shadow-[0_20px_80px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 mb-3">
            <Printer className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your print jobs</p>
        </div>

        {status && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm backdrop-blur-md ${
              status.tone === 'error'
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {status.tone === 'error' ? (
                <AlertCircle className="h-4 w-4 mt-0.5 text-rose-300" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-300" />
              )}
              <span>{status.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
