import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_ACCOUNTS, DemoAccount } from '../../data/demoAccounts';
import { dbService } from '../../services/db';
import {
  Users,
  ShieldCheck,
  Key,
  Copy,
  Check,
  LogIn,
  Database,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Award,
  FileCheck,
} from 'lucide-react';

interface UserManagerProps {
  onRefreshData?: () => Promise<void>;
}

export const UserManager: React.FC<UserManagerProps> = ({ onRefreshData }) => {
  const { currentUser, quickDemoLogin, isLiveFirebase } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await dbService.seedInitialDataToFirestore();
      setSeedResult(res);
      if (onRefreshData && res.success) {
        await onRefreshData();
      }
    } catch (err: any) {
      setSeedResult({
        success: false,
        message: err.message || 'Failed to seed data into database',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredAccounts = filterRole === 'all'
    ? DEMO_ACCOUNTS
    : DEMO_ACCOUNTS.filter((acc) => acc.role === filterRole);

  const permissionsMatrix = [
    { module: 'Dashboard & Metrics', super: true, admin: true, editor: true, reporter: true, mod: true },
    { module: 'Article Publishing & Editing (CRUD)', super: true, admin: true, editor: true, reporter: true, mod: false },
    { module: 'Direct Article Publishing (Live)', super: true, admin: true, editor: true, reporter: false, mod: false },
    { module: 'Fetch News from URL & AI Assistant', super: true, admin: true, editor: true, reporter: false, mod: false },
    { module: 'Breaking News Flash Bar', super: true, admin: true, editor: true, reporter: false, mod: false },
    { module: 'Categories & Local Districts', super: true, admin: true, editor: false, reporter: false, mod: false },
    { module: 'Journalists / Authors Directory', super: true, admin: true, editor: true, reporter: false, mod: false },
    { module: 'Video News Hub', super: true, admin: true, editor: true, reporter: true, mod: false },
    { module: 'E-Paper Editions (PDF & Web)', super: true, admin: true, editor: true, reporter: false, mod: false },
    { module: 'Ad Units & Monetization', super: true, admin: true, editor: false, reporter: false, mod: false },
    { module: 'SEO & Google News Metadata', super: true, admin: true, editor: false, reporter: false, mod: false },
    { module: 'Site Branding & Global Settings', super: true, admin: true, editor: false, reporter: false, mod: false },
    { module: 'User Accounts & Roles Management', super: true, admin: false, editor: false, reporter: false, mod: false },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Seeding Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-600/20 text-red-500 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-white">
                User Management & Role Credentials
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Staff accounts, permission tiers, and 1-click credential switching
              </p>
            </div>
          </div>
        </div>

        {/* Database Seeder Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synchronizing Database...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Sync Database (Seed Firestore)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seed Alert Status */}
      {seedResult && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            seedResult.success
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {seedResult.success ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{seedResult.message}</span>
          </div>
          <button
            onClick={() => setSeedResult(null)}
            className="text-xs underline hover:opacity-80 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Active Account Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.displayName}
            className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{currentUser?.displayName}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-red-600/30 text-red-400 border border-red-500/40">
                Active Session: {currentUser?.role}
              </span>
            </div>
            <div className="text-xs text-slate-400">{currentUser?.email}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
          Persistence Mode:{' '}
          <span className="font-semibold text-emerald-400">
            {isLiveFirebase ? 'Firebase Firestore Live' : 'Local Persistence'}
          </span>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <span className="text-xs font-semibold text-slate-400 mr-1">Filter by role:</span>
        {[
          { id: 'all', label: 'All Roles' },
          { id: 'super_admin', label: 'Super Admin' },
          { id: 'admin', label: 'Admin' },
          { id: 'editor', label: 'Editor' },
          { id: 'reporter', label: 'Reporter' },
          { id: 'moderator', label: 'Moderator' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterRole(btn.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterRole === btn.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 2. User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const isCurrentlyActive = currentUser?.email === acc.email;

          return (
            <div
              key={acc.id}
              className={`bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-xl ${
                isCurrentlyActive
                  ? 'border-red-500 ring-1 ring-red-500/40 shadow-red-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Photo, Name, Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.photoURL}
                      alt={acc.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">{acc.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{acc.designation}</p>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold border ${acc.badgeColor}`}>
                    {acc.badge}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">📍 {acc.location}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 mb-4 line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  {acc.bio}
                </p>

                {/* Credentials Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5 mb-4">
                  {/* Email */}
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Login Email / ID</span>
                      <button
                        onClick={() => copyToClipboard(acc.email, `${acc.id}-email`)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                        title="Copy Email"
                      >
                        {copiedKey === `${acc.id}-email` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    <code className="text-xs font-mono text-emerald-300 block select-all font-semibold mt-0.5">
                      {acc.email}
                    </code>
                  </div>

                  {/* Password */}
                  <div className="pt-2 border-t border-slate-900">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-400" /> Password
                      </span>
                      <button
                        onClick={() => copyToClipboard(acc.password, `${acc.id}-pass`)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                        title="Copy Password"
                      >
                        {copiedKey === `${acc.id}-pass` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                    </div>
                    <code className="text-xs font-mono text-amber-300 block select-all font-bold mt-0.5">
                      {acc.password}
                    </code>
                  </div>
                </div>

                {/* Permissions Description & Tags */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-slate-400">Permissions & Access:</div>
                  <p className="text-xs text-slate-300">{acc.permissionsDescription}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {acc.allowedFeatures.map((feat, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Switch Button */}
              <div className="pt-3 border-t border-slate-800">
                {isCurrentlyActive ? (
                  <div className="w-full bg-slate-800 text-emerald-400 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Current Active Session</span>
                  </div>
                ) : (
                  <button
                    onClick={() => quickDemoLogin(acc)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Switch to this Account</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Role-Based Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-base text-white">
            Role-Based Permissions Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Module / Feature</th>
                <th className="py-3 px-3 text-center text-red-400">Super Admin</th>
                <th className="py-3 px-3 text-center text-purple-400">Admin</th>
                <th className="py-3 px-3 text-center text-blue-400">Editor</th>
                <th className="py-3 px-3 text-center text-emerald-400">Reporter</th>
                <th className="py-3 px-3 text-center text-amber-400">Moderator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-white">{row.module}</td>
                  <td className="py-2.5 px-3 text-center">
                    {row.super ? (
                      <span className="text-emerald-400 font-bold">✓ Full</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.admin ? (
                      <span className="text-emerald-400 font-bold">✓ Full</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.editor ? (
                      <span className="text-emerald-400 font-bold">✓ Full</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.reporter ? (
                      <span className="text-emerald-400 font-bold">✓ Draft / Create</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.mod ? (
                      <span className="text-emerald-400 font-bold">✓ View Only</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
