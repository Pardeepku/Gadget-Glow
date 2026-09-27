import React, { useState } from 'react';
import { SeoAuditResult } from '../../utils/seoAuditor';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  Smartphone,
  Monitor,
  Target,
  Hash,
  FileText,
  HelpCircle,
  TrendingUp,
  BarChart2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ArticleSeoAuditPanelProps {
  audit: SeoAuditResult;
  focusKeyword: string;
  onFocusKeywordChange: (keyword: string) => void;
  onAutoGenerateMeta?: () => void;
  title: string;
  slug: string;
  shortDescription: string;
  isCompact?: boolean;
}

export const ArticleSeoAuditPanel: React.FC<ArticleSeoAuditPanelProps> = ({
  audit,
  focusKeyword,
  onFocusKeywordChange,
  onAutoGenerateMeta,
  title,
  slug,
  shortDescription,
  isCompact = false,
}) => {
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'summary' | 'serp' | 'checklist'>('summary');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'issues' | 'passed'>('all');
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(true);

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-600 text-emerald-400';
    if (score >= 70) return 'from-teal-500 to-emerald-600 text-teal-400';
    if (score >= 50) return 'from-amber-500 to-yellow-600 text-amber-400';
    return 'from-rose-500 to-red-600 text-red-400';
  };

  // Filtered checklist
  const filteredChecklist = audit.checklist.filter((item) => {
    if (checklistFilter === 'issues') return item.status !== 'passed';
    if (checklistFilter === 'passed') return item.status === 'passed';
    return true;
  });

  const passedCount = audit.checklist.filter((i) => i.status === 'passed').length;
  const issueCount = audit.checklist.filter((i) => i.status !== 'passed').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* 1. Header Bar with Real-Time Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Real-Time SEO Audit</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${audit.ratingColor}`}>
                {audit.ratingLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live analysis of Keyword Density, Title Length, Meta Description, & SERP snippet
            </p>
          </div>
        </div>

        {/* Score Radial / Badge */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-baseline gap-1 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-xs text-slate-400 font-medium">SEO Score:</span>
            <span className={`font-mono font-black text-xl bg-gradient-to-r ${getScoreColor(audit.score)} bg-clip-text text-transparent`}>
              {audit.score}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>

          {/* Quick tab switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeTab === 'summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Auditor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('serp')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'serp' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Google SERP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeTab === 'checklist' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Checklist ({passedCount}/{audit.checklist.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SUMMARY & CORE AUDIT GAUGES */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Target / Focus Keyword Configuration */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-500" />
                <span>Focus / Target Keyword</span>
                <span className="text-[10px] text-slate-400 font-normal">(Primary topic for SEO density)</span>
              </label>

              {audit.topKeywords.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowKeywordSuggestions(!showKeywordSuggestions)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{showKeywordSuggestions ? 'Hide detected keywords' : 'Show detected keywords'}</span>
                  {showKeywordSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => onFocusKeywordChange(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Chandrayaan, Election Results..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {focusKeyword && (
                <button
                  type="button"
                  onClick={() => onFocusKeywordChange('')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                  title="Clear keyword"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Top Keywords Auto-Suggestion Pills */}
            {showKeywordSuggestions && audit.topKeywords.length > 0 && (
              <div className="pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Frequently Used In This Article (Click to set):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {audit.topKeywords.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onFocusKeywordChange(item.word)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        focusKeyword.toLowerCase() === item.word.toLowerCase()
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <Hash className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{item.word}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.count}x • {item.density}%)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 Core Metric Cards: Keyword Density, Title Length, Meta Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. KEYWORD DENSITY AUDIT CARD */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Keyword Density
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      audit.keywordStatus === 'optimal'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : audit.keywordStatus === 'low' || audit.keywordStatus === 'high'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-red-400 border border-rose-500/30'
                    }`}
                  >
                    {audit.keywordStatus === 'optimal'
                      ? 'Optimal'
                      : audit.keywordStatus === 'low'
                      ? 'Low'
                      : audit.keywordStatus === 'high'
                      ? 'High'
                      : audit.keywordStatus === 'stuffing'
                      ? 'Stuffing!'
                      : 'Missing'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-white">
                    {audit.keywordDensity}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    ({audit.keywordMatches} {audit.keywordMatches === 1 ? 'match' : 'matches'})
                  </span>
                </div>

                {/* Density Bar (Optimal 1.0% - 2.5%) */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    {/* Visual target zones */}
                    <div
                      className={`h-full transition-all duration-300 ${
                        audit.keywordDensity === 0
                          ? 'bg-red-500 w-0'
                          : audit.keywordDensity < 0.8
                          ? 'bg-amber-500'
                          : audit.keywordDensity <= 2.5
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (audit.keywordDensity / 3.5) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0%</span>
                    <span className="text-emerald-400 font-bold">1.0% - 2.5% Target</span>
                    <span>3.5%+</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {audit.keywordMessage}
                </p>
              </div>

              {/* Keyword Placement Indicators */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400">
                  {audit.keywordInTitle ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                  <span className={audit.keywordInTitle ? 'text-emerald-300 font-medium' : ''}>In Title</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  {audit.keywordInMetaDescription ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                  <span className={audit.keywordInMetaDescription ? 'text-emerald-300 font-medium' : ''}>In Meta</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  {audit.keywordInFirst100Words ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                  <span className={audit.keywordInFirst100Words ? 'text-emerald-300 font-medium' : ''}>First 100 W</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  {audit.keywordInSlug ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                  <span className={audit.keywordInSlug ? 'text-emerald-300 font-medium' : ''}>In URL Slug</span>
                </div>
              </div>
            </div>

            {/* 2. TITLE LENGTH AUDIT CARD */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Headline Length
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      audit.titleStatus === 'optimal'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : audit.titleStatus === 'acceptable' || audit.titleStatus === 'slightly_long'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-red-400 border border-rose-500/30'
                    }`}
                  >
                    {audit.titleStatus === 'optimal'
                      ? 'Optimal (40-60)'
                      : audit.titleStatus === 'acceptable'
                      ? 'Acceptable'
                      : audit.titleStatus === 'slightly_long'
                      ? 'Slightly Long'
                      : audit.titleStatus === 'too_long'
                      ? 'Too Long'
                      : 'Too Short'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-white">
                    {audit.titleLength}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / 60 chars recommended
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        audit.titleLength === 0
                          ? 'bg-red-500 w-0'
                          : audit.titleLength < 30
                          ? 'bg-red-500'
                          : audit.titleLength < 40
                          ? 'bg-amber-500'
                          : audit.titleLength <= 60
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (audit.titleLength / 70) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0</span>
                    <span className="text-emerald-400 font-bold">40 - 60 optimal</span>
                    <span>70+</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {audit.titleMessage}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Google SERP Visibility:</span>
                <span className={`font-semibold ${audit.titleLength <= 60 && audit.titleLength >= 35 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {audit.titleLength > 65 ? 'Truncated on SERP' : '100% Fully Visible'}
                </span>
              </div>
            </div>

            {/* 3. META DESCRIPTION AUDIT CARD */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    Meta Description
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      !audit.metaDescriptionPresent
                        ? 'bg-rose-500/20 text-red-400 border border-rose-500/30'
                        : audit.metaDescriptionStatus === 'optimal'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {!audit.metaDescriptionPresent ? 'Missing ⚠️' : audit.metaDescriptionStatus === 'optimal' ? 'Optimal (120-160)' : 'Present'}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-white">
                    {audit.metaDescriptionLength}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / 160 chars recommended
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        !audit.metaDescriptionPresent
                          ? 'bg-red-500 w-0'
                          : audit.metaDescriptionLength < 70
                          ? 'bg-amber-500'
                          : audit.metaDescriptionLength <= 160
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (audit.metaDescriptionLength / 180) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0</span>
                    <span className="text-emerald-400 font-bold">120 - 160 optimal</span>
                    <span>180+</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {audit.metaDescriptionMessage}
                </p>
              </div>

              {onAutoGenerateMeta && !audit.metaDescriptionPresent && (
                <button
                  type="button"
                  onClick={onAutoGenerateMeta}
                  className="w-full mt-2 py-1.5 px-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Generate Meta Description</span>
                </button>
              )}

              {audit.metaDescriptionPresent && (
                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Snippet Status:</span>
                  <span className={`font-semibold ${audit.metaDescriptionLength <= 160 && audit.metaDescriptionLength >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {audit.metaDescriptionLength > 160 ? 'Will truncate on SERP' : 'Fits Google Snippet'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Banner (Word Count, Reading Time, Subheadings, Image) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Total Words</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">{audit.wordCount}</span>
              <span className={`text-[10px] font-medium ${audit.wordCount >= 300 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {audit.wordCount >= 300 ? 'Good Length' : 'Thin (<300)'}
              </span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Reading Time</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">~{audit.readingTimeMinutes} min</span>
              <span className="text-[10px] text-slate-500 font-medium">200 words/min</span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Lead Paragraph</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">
                {audit.keywordInFirst100Words ? 'Present' : 'Not Found'}
              </span>
              <span className={`text-[10px] font-medium ${audit.keywordInFirst100Words ? 'text-emerald-400' : 'text-slate-500'}`}>
                {audit.keywordInFirst100Words ? 'Keyword in intro' : 'First 100 words'}
              </span>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2.5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Subheadings</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">
                {audit.hasSubheadings ? 'H2 / H3 Found' : 'None'}
              </span>
              <span className={`text-[10px] font-medium ${audit.hasSubheadings ? 'text-emerald-400' : 'text-amber-400'}`}>
                {audit.hasSubheadings ? 'Good Structure' : 'Add H2/H3 tags'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GOOGLE SERP PREVIEW */}
      {activeTab === 'serp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Google Search Engine Results Page (SERP) Live Simulator</span>
            </span>

            {/* Device switcher */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSerpDevice('desktop')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
                  serpDevice === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setSerpDevice('mobile')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
                  serpDevice === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* SERP Card Frame */}
          <div className={`mx-auto bg-white text-slate-900 rounded-xl p-4 sm:p-5 shadow-lg border border-slate-200 transition-all ${
            serpDevice === 'mobile' ? 'max-w-md' : 'w-full'
          }`}>
            {/* Google Site Identity */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                G
              </div>
              <div className="flex flex-col text-xs leading-none">
                <span className="font-semibold text-slate-800">Gadget Glow Hindi News</span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  https://gadgetglow.com › news › {slug || 'article-slug'}
                </span>
              </div>
            </div>

            {/* Google Blue Link Headline */}
            <h4 className="font-medium text-lg text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
              {title || 'Enter your headline above to preview SERP snippet...'}
            </h4>

            {/* Snippet Body */}
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed line-clamp-3">
              <span className="text-slate-400 font-mono text-[11px] mr-1">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —
              </span>
              {shortDescription ? (
                // Highlight keyword if present
                focusKeyword ? (
                  <span>
                    {shortDescription}
                  </span>
                ) : (
                  shortDescription
                )
              ) : (
                <span className="text-red-500 italic">
                  [Missing meta description! Google will automatically extract a snippet from your content that may not highlight your key hook.]
                </span>
              )}
            </p>
          </div>

          {/* Diagnostic indicators below SERP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">Title truncation check:</span>
              <p className={audit.titleLength > 60 ? 'text-amber-400' : 'text-emerald-400'}>
                {audit.titleLength > 60
                  ? `Headline is ${audit.titleLength} characters. Google typically truncates after 60 chars.`
                  : `Headline is ${audit.titleLength} characters. Perfect length to display completely.`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold">Meta description check:</span>
              <p className={audit.metaDescriptionPresent && audit.metaDescriptionLength <= 160 ? 'text-emerald-400' : 'text-amber-400'}>
                {!audit.metaDescriptionPresent
                  ? 'No meta description found. Add a 120-160 character lead summary.'
                  : audit.metaDescriptionLength > 160
                  ? `Meta description is ${audit.metaDescriptionLength} characters and will be cut off with '...'.`
                  : `Meta description is ${audit.metaDescriptionLength} characters. Ideal length!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE SEO CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Audit Checklist ({passedCount} Passed, {issueCount} Need Attention)
            </span>

            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setChecklistFilter('all')}
                className={`px-2 py-0.5 rounded-md ${
                  checklistFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({audit.checklist.length})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('issues')}
                className={`px-2 py-0.5 rounded-md ${
                  checklistFilter === 'issues' ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Issues ({issueCount})
              </button>
              <button
                type="button"
                onClick={() => setChecklistFilter('passed')}
                className={`px-2 py-0.5 rounded-md ${
                  checklistFilter === 'passed' ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Passed ({passedCount})
              </button>
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-2">
            {filteredChecklist.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  item.status === 'passed'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : item.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {item.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{item.label}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        item.importance === 'critical'
                          ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                          : item.importance === 'recommended'
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
