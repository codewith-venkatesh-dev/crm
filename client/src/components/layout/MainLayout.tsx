import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Plus,
  Building2,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { LeadFormModal } from '../leads/LeadFormModal';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperAdmin, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/leads') return 'Lead Directory';
    if (location.pathname === '/pipeline') return 'Sales Pipeline';
    if (location.pathname === '/users') return 'User Rights Management';
    if (location.pathname.startsWith('/leads/')) return 'Lead Overview';
    return 'CRM';
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  ];

  if (isSuperAdmin) {
    navItems.push({ to: '/users', label: 'User Rights', icon: ShieldCheck });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Apex CRM</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight">Apex CRM</h1>
            <p className="text-xs text-slate-400">Internal Sales Platform</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logged in User Profile Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.userRight === 1 ? '⚡ Super Admin' : 'Sales Agent'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{getPageTitle()}</h2>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                {user.name} ({user.userRight === 1 ? 'Super Admin' : 'Agent'})
              </span>
            )}
            <button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>
          </div>
        </header>

        {/* Main Body View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Lead Creation Modal */}
      {isAddLeadModalOpen && (
        <LeadFormModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
        />
      )}
    </div>
  );
};
