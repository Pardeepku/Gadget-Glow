import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Lock,
  Mail,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Download,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '../../data/demoAccounts';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Trigger downloadable TXT file of all passwords
  const handleDownloadPasswords = () => {
    const textContent = `========================================================================
             GADGET GLOW - CMS STAFF ACCESS CREDENTIALS
========================================================================
Portal: Gadget Glow (Digital News & Editorial Content Management System)
Date Generated: ${new Date().toISOString().split('T')[0]}
Confidential: For Authorized Newsroom Personnel Only

------------------------------------------------------------------------
1. SUPER ADMIN (प्रधान संपादक एवं सर्वोच्च प्रशासक)
------------------------------------------------------------------------
Name:        प्रदीप सैनी (Pradeep Saini)
Role:        super_admin (Editor-in-Chief & Super Admin)
Email:       superadmin@gadgetglow.com  (or superadmin@samacharfirst.com)
Password:    SuperAdmin@2026
Designation: प्रधान संपादक (Editor-in-Chief)
Permissions: Full System Control, User RBAC Management, Categories, Ads,
             SEO Settings, E-Paper, Direct Publishing, Activity Logs.

------------------------------------------------------------------------
2. CHIEF ADMINISTRATOR (मुख्य प्रशासक)
------------------------------------------------------------------------
Name:        राजेश कुमार (Rajesh Kumar)
Role:        admin (Chief Administrator & General Manager)
Email:       admin@gadgetglow.com  (or admin@samacharfirst.com)
Password:    Admin@2026
Designation: मुख्य प्रशासक (Chief Administrator)
Permissions: Advertisement Contracts, Category & District Management,
             Site Settings, Staff Monitoring, Article Moderation.

------------------------------------------------------------------------
3. DESK EDITOR (वरिष्ठ उप-संपादक)
------------------------------------------------------------------------
Name:        अमित भारद्वाज (Amit Bhardwaj)
Role:        editor (Senior Desk Editor & Content Head)
Email:       editor@gadgetglow.com  (or editor@samacharfirst.com)
Password:    Editor@2026
Designation: वरिष्ठ उप-संपादक (Senior Desk Editor)
Permissions: Article Review & Live Publishing, Breaking News Alerts,
             AI Auto-Fetch & Rewrite, Video News, E-Paper Management.

------------------------------------------------------------------------
4. SPECIAL CORRESPONDENT / REPORTER (विशेष संवाददाता)
------------------------------------------------------------------------
Name:        पूजा शर्मा (Pooja Sharma)
Role:        reporter (Special Correspondent)
Email:       reporter@gadgetglow.com  (or reporter@samacharfirst.com)
Password:    Reporter@2026
Designation: विशेष संवाददाता (Special Correspondent)
Permissions: Write New Articles, Submit Field Drafts, Upload Ground Photos.

------------------------------------------------------------------------
5. COMMUNITY MODERATOR (कम्युनिटी मॉडरेटर)
------------------------------------------------------------------------
Name:        राहुल वर्मा (Rahul Verma)
Role:        moderator (Community Moderator & Reader Representative)
Email:       user@gadgetglow.com  (or user@samacharfirst.com)
Password:    User@2026
Designation: कम्युनिटी मॉडरेटर (Community Moderator)
Permissions: Reader Comments Moderation, Public Feedback Verification.

========================================================================
Login URL: /admin
Website URL: /
========================================================================
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gadget-glow-cms-passwords.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = 'Login failed. Please check your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Account temporarily locked due to too many failed attempts. Please try again later.';
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setError('');
    try {
      await resetPassword(resetEmail.trim());
      setSuccessMessage('Password reset instructions sent or logged.');
      setShowForgotModal(false);
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Brand Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center justify-center space-x-2 mb-3">
          <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-2xl sm:text-3xl px-3.5 py-1 rounded-xl font-serif shadow-lg shadow-red-950/60 tracking-wider">
            GADGET
          </span>
          <span className="text-white font-black text-2xl sm:text-3xl font-serif tracking-wider">
            GLOW
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Editorial & CMS Administration Control Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Secure newsroom management portal for Editors, Reporters, Administrators and Staff
        </p>
      </div>

      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Main Login Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                CMS Secure Login
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Sign in with your authorized staff email</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              Encrypted
            </span>
          </div>

          {error && (
            <div className="mb-4 bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address (ईमेल)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@gadgetglow.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password (पासवर्ड)
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:bg-slate-700 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Signing in to CMS...</span>
              ) : (
                <>
                  <span>Sign In to Gadget Glow CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-200 mb-2">
                <KeyRound className="w-4 h-4 text-red-400" />
                <span>Password Reset Support</span>
              </div>
              <p className="text-slate-400 mb-3 text-[11px] leading-relaxed">
                Enter your registered staff email address to receive password reset instructions:
              </p>
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter staff email"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {resetLoading ? 'Checking...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Portal
            </div>
          </div>
        </div>

        {/* Download Passwords Section (Requirement 3) */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4.5 shadow-xl text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Staff Passwords & Credentials File</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
            All passwords and staff login credentials have been removed from this page for security. You can download the full credentials text file below:
          </p>

          <button
            type="button"
            onClick={handleDownloadPasswords}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-100 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download All Passwords (.txt)</span>
          </button>

          {downloadSuccess && (
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>File 'gadget-glow-cms-passwords.txt' downloaded successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
