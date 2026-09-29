import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  LayoutDashboard,
  FileText,
  Flame,
  FolderTree,
  Users,
  Video,
  Newspaper,
  DollarSign,
  Search,
  Settings,
  Activity,
  LogOut,
  ExternalLink,
  PlusCircle,
  Menu,
  X,
  ShieldCheck,
  Globe,
  Sparkles,
  Bot,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'articles'
  | 'auto_fetch'
  | 'ai_images'
  | 'ai_models'
  | 'breaking'
  | 'categories'
  | 'authors'
  | 'videos'
  | 'epaper'
  | 'ads'
  | 'seo'
  | 'settings'
  | 'users'
  | 'activity';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateToPublic: () => void;
  onCreateArticle: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onNavigateToPublic,
  onCreateArticle,
  children,
}) => {
  const { currentUser, logout, isLiveFirebase } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'articles', label: 'News Articles', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'auto_fetch',
      label: 'Fetch News from URL',
      icon: <Globe className="w-4 h-4 text-sky-400" />,
      badge: 'Auto',
    },
    {
      id: 'ai_images',
      label: 'AI Image Studio Agent',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      badge: 'AI Studio',
    },
    {
      id: 'ai_models',
      label: 'AI Models & API Keys',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      badge: 'OpenAI ChatGPT',
    },
    { id: 'breaking', label: 'Breaking News Ticker', icon: <Flame className="w-4 h-4 text-amber-400" /> },
    { id: 'categories', label: 'Categories & Districts', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'authors', label: 'Reporters & Authors', icon: <Users className="w-4 h-4" /> },
    { id: 'videos', label: 'Video Bulletins', icon: <Video className="w-4 h-4" /> },
    { id: 'epaper', label: 'Digital E-Paper', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'ads', label: 'Advertisements', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO & Sitemap', icon: <Search className="w-4 h-4" /> },
    { id: 'settings', label: 'Portal Settings', icon: <Settings className="w-4 h-4" /> },
    {
      id: 'users',
      label: 'User Roles & Access',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      badge: '5 Roles',
    },
    { id: 'activity', label: 'Audit & Activity Logs', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* 1. SIDEBAR (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg tracking-wider uppercase">
                GADGET GLOW
              </span>
              <span className="font-bold text-xs tracking-tight text-slate-600 dark:text-slate-300">CMS</span>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="p-3.5 mx-3 my-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-sm">
              {currentUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.displayName || 'Admin'}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {currentUser?.role === 'super_admin' ? 'Super Admin' : currentUser?.role || 'Admin'}
              </div>
            </div>
          </div>

          {/* Quick Create Button */}
          <div className="px-3 mb-3">
            <button
              onClick={() => {
                onCreateArticle();
                setMobileSidebarOpen(false);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Article</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] no-scrollbar">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    active
                      ? 'bg-red-600 text-white font-semibold shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>{item.icon}</span>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-400/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          {/* Theme switcher in sidebar */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Admin Theme</span>
            <ThemeToggle variant="pill" />
          </div>

          <button
            onClick={onNavigateToPublic}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-amber-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-amber-500" />
            <span>View Public Website</span>
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">
              Editorial CMS & Newsroom Control Center
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Live DB Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isLiveFirebase ? 'Firebase Live' : 'Local Store'}
            </div>

            {/* Admin Theme Toggle Button */}
            <ThemeToggle variant="button" />

            <button
              onClick={onNavigateToPublic}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Website</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors">{children}</main>
      </div>
    </div>
  );
};
