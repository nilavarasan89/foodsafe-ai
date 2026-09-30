import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@foodsafe.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = res.data;
      localStorage.setItem('foodsafe_token', access_token);
      localStorage.setItem('foodsafe_user', JSON.stringify(user));
      onLoginSuccess(user, access_token);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback demo login if backend offline or CORS issue
      if (email === 'admin@foodsafe.ai' && password === 'admin123') {
        const mockUser = { id: 'usr-admin', email: 'admin@foodsafe.ai', full_name: 'Admin Supervisor', role: 'ADMIN' };
        localStorage.setItem('foodsafe_token', 'demo-token-123');
        localStorage.setItem('foodsafe_user', JSON.stringify(mockUser));
        onLoginSuccess(mockUser, 'demo-token-123');
        navigate('/');
      } else {
        setError(err.response?.data?.detail || 'Invalid login credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'ADMIN' | 'OPERATOR' | 'QUALITY') => {
    if (role === 'ADMIN') {
      setEmail('admin@foodsafe.ai');
      setPassword('admin123');
    } else if (role === 'OPERATOR') {
      setEmail('operator@foodsafe.ai');
      setPassword('operator123');
    } else {
      setEmail('quality@foodsafe.ai');
      setPassword('quality123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background technical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

      <div className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FOODSAFE AI</h1>
          <p className="text-xs text-blue-400 font-medium mt-1">
            AI-Powered Inline Food Inspection & Traceability
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Problem SIH26233 Prototype Platform</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="operator@foodsafe.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">
            Quick Demo Login Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('ADMIN')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium rounded border border-slate-800 transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoLogin('OPERATOR')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium rounded border border-slate-800 transition-colors"
            >
              Operator
            </button>
            <button
              onClick={() => handleDemoLogin('QUALITY')}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium rounded border border-slate-800 transition-colors"
            >
              Quality Mgr
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-3 font-mono">
            Demo Credentials: admin@foodsafe.ai / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
