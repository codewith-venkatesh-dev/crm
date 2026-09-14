import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Building2, Lock, Mail, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      login(data.token, data.user);
      toast(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    try {
      const data = await api.login(demoEmail, 'password123');
      login(data.token, data.user);
      toast(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Quick login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Apex Mini CRM</h2>
        <p className="mt-2 text-sm text-slate-400">
          Internal Sales Platform & Lead Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crm.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 text-white text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 text-white text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Sign In Shortcuts */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              Quick Test Sign In
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@crm.com')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-200 rounded-xl text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <div className="text-left">
                    <span className="font-semibold block">Super Admin (userRight = 1)</span>
                    <span className="text-[10px] text-slate-400">admin@crm.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">
                  Full Rights
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent@crm.com')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <div className="text-left">
                    <span className="font-semibold block">Sales Representative (userRight = 0)</span>
                    <span className="text-[10px] text-slate-400">agent@crm.com</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  Normal
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
