import React, { useState } from 'react';
import { SeoSettings, Article, Category } from '../../types';
import { generateXmlSitemap } from '../../utils/seo';
import { Search, Globe, CheckCircle, Save, Download, Copy, FileCode, Check, ShieldCheck } from 'lucide-react';

interface SeoSettingsManagerProps {
  seoSettings: SeoSettings;
  articles: Article[];
  categories: Category[];
  onSaveSeo: (settings: SeoSettings) => Promise<void>;
}

export const SeoSettingsManager: React.FC<SeoSettingsManagerProps> = ({
  seoSettings,
  articles,
  categories,
  onSaveSeo,
}) => {
  const [metaTitle, setMetaTitle] = useState(seoSettings.metaTitle);
  const [metaDescription, setMetaDescription] = useState(seoSettings.metaDescription);
  const [metaKeywords, setMetaKeywords] = useState(seoSettings.metaKeywords);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(seoSettings.googleAnalyticsId || '');
  const [googleSearchConsoleVerification, setGoogleSearchConsoleVerification] = useState(
    seoSettings.googleSearchConsoleVerification || ''
  );
  const [googleNewsPublisherId, setGoogleNewsPublisherId] = useState(seoSettings.googleNewsPublisherId || '');
  const [robotsTxt, setRobotsTxt] = useState(
    seoSettings.robotsTxt ||
      'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://gadgetglow.com/sitemap.xml'
  );
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const xmlSitemap = generateXmlSitemap(articles, categories, window.location.origin);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSeo({
      metaTitle,
      metaDescription,
      metaKeywords,
      googleAnalyticsId,
      googleSearchConsoleVerification,
      googleNewsPublisherId,
      robotsTxt,
      canonicalUrl: window.location.origin,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-red-500" />
            SEO & Google News Publisher Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure Google News metadata, Search Console verification, GA4 analytics, and dynamic XML sitemap
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Global Meta Tags */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-red-500" />
            Global Meta Tags & Canonical
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Default Meta Title *
            </label>
            <input
              type="text"
              required
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Default Meta Description *
            </label>
            <textarea
              rows={2}
              required
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Meta Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="news, haryana, india, breaking news, politics"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* 2. Google Verification & Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Google News & Analytics Integrations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google Search Console HTML Meta Tag
              </label>
              <input
                type="text"
                value={googleSearchConsoleVerification}
                onChange={(e) => setGoogleSearchConsoleVerification(e.target.value)}
                placeholder="google-site-verification=..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Google News Publisher Center ID
              </label>
              <input
                type="text"
                value={googleNewsPublisherId}
                onChange={(e) => setGoogleNewsPublisherId(e.target.value)}
                placeholder="e.g., GNEWS-987456"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Robots.txt Directives
            </label>
            <textarea
              rows={3}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-emerald-400 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              SEO settings updated successfully!
            </div>
          )}
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg ml-auto transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save SEO Settings</span>
          </button>
        </div>
      </form>

      {/* 3. Live XML Sitemap Preview & Test */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              Live Google XML Sitemap Feed
            </h2>
            <p className="text-xs text-slate-400">
              Auto-generated and compliant with Google News and Search Console guidelines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(xmlSitemap);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy XML'}</span>
            </button>
          </div>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-56">
          {xmlSitemap}
        </pre>
      </div>
    </div>
  );
};
