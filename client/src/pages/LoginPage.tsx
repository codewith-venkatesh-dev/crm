import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import { NetworkStatusBanner } from '../components/common/NetworkStatusBanner';
import { Handshake, Lock, Mail, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col text-[#1E293B]">
      <NetworkStatusBanner />

      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white border border-[#E2E8F0] py-8 px-4 shadow-sm rounded-2xl sm:px-10">
            <div className="text-center border-b border-[#E2E8F0] mb-4 pb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4F46E5] text-white shadow-md shadow-indigo-600/20 mb-4">
                <Handshake className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Leadly</h2>
              <p className="mt-2 text-sm text-[#64748B]">
                Manage leads. Move opportunities forward.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@crm.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] text-[#1E293B] text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] text-[#1E293B] text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
              </button>
            </form>

            {/* Quick Demo Sign In Shortcuts */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] text-center">
                Quick Test Sign In
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@crm.com')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#4F46E5]" />
                    <div className="text-left">
                      <span className="font-semibold block">Super Admin (userRight = 1)</span>
                      <span className="text-[10px] text-[#64748B]">admin@crm.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 px-2 py-0.5 rounded text-indigo-700">
                    Full Rights
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('agent@crm.com')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#1E293B] rounded-xl text-xs font-medium transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#64748B]" />
                    <div className="text-left">
                      <span className="font-semibold block">Sales Representative (userRight = 0)</span>
                      <span className="text-[10px] text-[#64748B]">agent@crm.com</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                    Normal
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
