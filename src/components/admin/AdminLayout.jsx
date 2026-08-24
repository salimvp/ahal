import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Trophy,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SSMOLogo from '../SSMOLogo';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Announcements & Links', path: '/admin/announcements', icon: Bell },
    { name: 'Moving Achievements', path: '/admin/achievements', icon: Trophy },
    { name: 'Photo Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Student Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Institute Profile & Leadership', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark text-ink-light flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-dark-surface border-r border-dark-border flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-dark-border flex items-center gap-3">
            <SSMOLogo className="w-9 h-9" />
            <div>
              <h2 className="text-sm font-bold font-sans text-white leading-tight">
                ITE
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-light">
                Management CMS
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-accent text-white shadow-soft-sm'
                        : 'text-ink-light-secondary hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-dark-border space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-xs text-ink-light-secondary hover:text-white bg-dark border border-dark-border transition-colors"
          >
            <span className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-accent-light" />
              Public Website
            </span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-dark overflow-y-auto">
        <header className="bg-dark-surface/80 backdrop-blur-md border-b border-dark-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink-light-muted">Authenticated user:</span>
            <span className="font-mono font-bold text-accent-light bg-dark px-2 py-0.5 rounded border border-dark-border">
              {user?.email || 'admin'}
            </span>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-ink-light-secondary hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3 text-accent-light" />
          </Link>
        </header>

        <div className="p-6 md:p-10 max-w-5xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
