import React, { useState } from 'react';
import { Article, Category, Author, VideoNews, BreakingNews, ActivityLog } from '../../types';
import {
  FileText,
  Flame,
  FolderTree,
  Users,
  Video,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Database,
  RefreshCw,
  Copy,
  Check,
  LogIn,
  Globe,
} from 'lucide-react';
import { AdminTab } from './AdminLayout';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/db';

interface AdminDashboardProps {
  articles: Article[];
  categories: Category[];
  authors: Author[];
  videos: VideoNews[];
  breakingNews: BreakingNews[];
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: AdminTab) => void;
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
  onRefreshData?: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  categories,
  authors,
  videos,
  breakingNews,
  activityLogs,
  onNavigateTab,
  onCreateArticle,
  onEditArticle,
  onRefreshData,
}) => {
  const { currentUser, quickDemoLogin } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedSuccess(null);
    try {
      const res = await dbService.seedInitialDataToFirestore();
      setSeedSuccess(res.message);
      if (onRefreshData && res.success) {
        await onRefreshData();
      }
    } catch (e: any) {
      setSeedSuccess(e.message || 'Seeding failed');
    } finally {
      setIsSeeding(false);
    }
  };

  const copyCreds = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = [
    {
      title: 'Total Articles',
      value: articles.length,
      sub: `${publishedCount} Published, ${draftCount} Draft`,
      icon: <FileText className="w-5 h-5 text-red-500" />,
      tab: 'articles' as AdminTab,
    },
    {
      title: 'Breaking Alerts',
      value: breakingNews.filter((b) => b.isActive).length,
      sub: `${breakingNews.length} in ticker`,
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      tab: 'breaking' as AdminTab,
    },
    {
      title: 'Categories & Districts',
      value: categories.length,
      sub: 'Active news sections',
      icon: <FolderTree className="w-5 h-5 text-indigo-500" />,
      tab: 'categories' as AdminTab,
    },
    {
      title: 'Reporters & Authors',
      value: authors.length,
      sub: 'Newsroom journalists',
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      tab: 'authors' as AdminTab,
    },
    {
      title: 'Video Bulletins',
      value: videos.length,
      sub: 'Video broadcasts',
      icon: <Video className="w-5 h-5 text-sky-500" />,
      tab: 'videos' as AdminTab,
    },
    {
      title: 'Total Article Views',
      value: totalViews.toLocaleString(),
      sub: 'Reader impressions',
      icon: <Eye className="w-5 h-5 text-purple-500" />,
      tab: 'articles' as AdminTab,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white tracking-tight">
            Editorial CMS Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Central newsroom control center for reporting, multimedia, breaking alerts, and URL importing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('auto_fetch')}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Fetch News from URL</span>
          </button>
          <button
            onClick={onCreateArticle}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
          <button
            onClick={() => onNavigateTab('breaking')}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-4 h-4" />
            <span>Breaking Ticker</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((st, i) => (
          <div
            key={i}
            onClick={() => onNavigateTab(st.tab)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-slate-800 rounded-xl">{st.icon}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">{st.value}</div>
              <div className="text-xs font-semibold text-slate-300 truncate mt-0.5">{st.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{st.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Credentials & Firestore Seeding Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                Demo User Accounts & Role Switching (5 Profiles)
              </h2>
              <p className="text-xs text-slate-400">
                1-Click test login as Super Admin, Editor, Reporter, or Moderator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              title="Seed all demo articles, categories, authors, and settings into Firestore"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing database...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Seed Demo Data</span>
                </>
              )}
            </button>
            <button
              onClick={() => onNavigateTab('users')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              <span>Manage Users →</span>
            </button>
          </div>
        </div>

        {seedSuccess && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{seedSuccess}</span>
            </div>
            <button onClick={() => setSeedSuccess(null)} className="underline text-xs">Dismiss</button>
          </div>
        )}

        {/* 5 Demo Accounts Horizontal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DEMO_ACCOUNTS.map((acc) => {
            const isActive = currentUser?.email === acc.email;
            return (
              <div
                key={acc.id}
                className={`bg-slate-950/80 rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                  isActive ? 'border-red-500 bg-red-950/15' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${acc.badgeColor}`}>
                      {acc.role.toUpperCase()}
                    </span>
                    {isActive && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{acc.name.split(' (')[0]}</div>
                  <div className="text-[11px] text-slate-400 truncate mb-2">{acc.designation.split(' (')[0]}</div>

                  <div className="space-y-1 bg-slate-900 p-2 rounded-lg text-[10px] font-mono border border-slate-800/60 mb-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="truncate text-emerald-400 select-all">{acc.email.split('@')[0]}@..</span>
                      <button
                        onClick={() => copyCreds(acc.email, `${acc.id}-em`)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="Copy Email"
                      >
                        {copiedId === `${acc.id}-em` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span className="truncate text-amber-400 select-all">{acc.password}</span>
                      <button
                        onClick={() => copyCreds(acc.password, `${acc.id}-pw`)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="Copy Password"
                      >
                        {copiedId === `${acc.id}-pw` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  {isActive ? (
                    <div className="text-[10px] font-bold text-center text-emerald-400 py-1 bg-emerald-950/40 rounded-lg border border-emerald-900/60">
                      Current User
                    </div>
                  ) : (
                    <button
                      onClick={() => quickDemoLogin(acc)}
                      className="w-full bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <LogIn className="w-3 h-3" /> Switch Role
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Content: Recent Articles & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Articles (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              Recent News Articles
            </h2>
            <button
              onClick={() => onNavigateTab('articles')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              View All Articles ({articles.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Headline</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Views</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {articles.slice(0, 7).map((art) => (
                  <tr key={art.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 max-w-[240px]">
                      <div className="font-semibold text-white truncate">{art.title}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {art.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{art.authorName}</td>
                    <td className="py-3 px-3">
                      {art.status === 'published' ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Published
                        </span>
                      ) : (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">{art.views.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onEditArticle(art)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border border-slate-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs & Quick System Status (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                System Activity Logs
              </h2>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                  <div className="text-[10px] text-slate-500 mt-1">By: {log.userName}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('activity')}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              View Full Audit Logs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
