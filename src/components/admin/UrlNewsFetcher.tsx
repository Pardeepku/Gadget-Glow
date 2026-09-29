import React, { useState, useEffect, useRef } from 'react';
import { Article, Category, Subcategory, Author } from '../../types';
import {
  RawNewsItem,
  SAMPLE_NEWS_URLS,
  fetchNewsFromUrl,
  rewriteNewsWithServerAI,
  regenerateNewsImageWithAI,
  researchTopicWithSearchGrounding,
  convertToArticle,
} from '../../services/newsFetcherService';
import {
  Link as LinkIcon,
  Sparkles,
  Send,
  Edit,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  Layers,
  Check,
  Eye,
  Trash2,
  Copy,
  Globe,
  Zap,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Image as ImageIcon,
  Home,
  FileText,
  Edit3,
} from 'lucide-react';
import { AiImageAgentModal } from './AiImageAgentModal';

interface UrlNewsFetcherProps {
  categories: Category[];
  subcategories: Subcategory[];
  authors: Author[];
  onPublishArticle: (articleData: Omit<Article, 'id'>) => Promise<Article>;
  onOpenArticleEditor: (articleData: Partial<Article>) => void;
  onViewLiveArticle: (slug: string) => void;
}

export const UrlNewsFetcher: React.FC<UrlNewsFetcherProps> = ({
  categories,
  subcategories,
  authors,
  onPublishArticle,
  onOpenArticleEditor,
  onViewLiveArticle,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedItem, setFetchedItem] = useState<RawNewsItem | null>(null);
  const [historyItems, setHistoryItems] = useState<RawNewsItem[]>([]);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [previewContentExpanded, setPreviewContentExpanded] = useState(true);

  // AI Rewriting states
  const [isRewritingWithAi, setIsRewritingWithAi] = useState(false);
  const [rewriteSeconds, setRewriteSeconds] = useState<number>(0);
  const [aiStyle, setAiStyle] = useState<'journalistic' | 'breaking' | 'investigative'>('journalistic');
  const [activeStoryTab, setActiveStoryTab] = useState<'rewritten' | 'original'>('rewritten');
  const [justPublishedArticle, setJustPublishedArticle] = useState<Article | null>(null);

  // AI Image Agent states
  const [isImageAgentOpen, setIsImageAgentOpen] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  // Tab: URL Fetcher vs Google Search Data Grounding
  const [activeTab, setActiveTab] = useState<'url' | 'search_grounding'>('url');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);

  // Google Search Grounding Research states
  const [searchTopicInput, setSearchTopicInput] = useState('');
  const [searchMode, setSearchMode] = useState<'news_brief' | 'research' | 'fact_check'>('news_brief');
  const [isResearchingSearch, setIsResearchingSearch] = useState(false);
  const [groundedResult, setGroundedResult] = useState<{
    text: string;
    sources: { title: string; uri: string }[];
    queries: string[];
    query: string;
  } | null>(null);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  const debounceTimerRef = useRef<any>(null);
  const rewriteIntervalRef = useRef<any>(null);
  const lastFetchedUrlRef = useRef<string>('');

  const defaultAuthor = authors[0] || {
    id: 'auth-1',
    name: 'Editorial Bureau',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    designation: 'Editorial Desk',
    role: 'Editorial Desk',
  };

  const showNotification = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Perform fetching from URL
  const performFetch = async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed || !trimmed.startsWith('http')) return;
    if (lastFetchedUrlRef.current === trimmed && fetchedItem) return;

    setIsFetching(true);
    setFetchError(null);
    setJustPublishedArticle(null);
    setFetchStatus('Connecting to news source...');

    try {
      setFetchStatus('Extracting headline, story content & featured image...');
      const raw = await fetchNewsFromUrl(trimmed);

      lastFetchedUrlRef.current = trimmed;
      setFetchedItem(raw);
      setActiveStoryTab('original');
      setHistoryItems((prev) => [raw, ...prev.filter((p) => p.sourceUrl !== trimmed)].slice(0, 10));
      setFetchStatus('');
      showNotification(`Extracted news from ${raw.sourceName}! Now click "Rewrite with AI" to generate a polished report.`);
    } catch (err: any) {
      console.error('URL Fetch failed:', err);
      setFetchError(err?.message || 'Failed to extract news from this URL. Please check the link and try again.');
      setFetchStatus('');
    } finally {
      setIsFetching(false);
    }
  };

  // Automatic fetch when URL input changes (with debounce)
  useEffect(() => {
    const trimmed = urlInput.trim();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (
      trimmed.length > 12 &&
      (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
      trimmed.includes('.') &&
      trimmed !== lastFetchedUrlRef.current
    ) {
      debounceTimerRef.current = setTimeout(() => {
        performFetch(trimmed);
      }, 600);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [urlInput]);

  // Handle immediate paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim();
    if (pastedText.startsWith('http://') || pastedText.startsWith('https://')) {
      setUrlInput(pastedText);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setTimeout(() => performFetch(pastedText), 50);
    }
  };

  // Manual submit handler
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      performFetch(urlInput.trim());
    }
  };

  // Rewrite with AI (in seconds)
  const handleRewriteWithAI = async (itemToRewrite?: RawNewsItem) => {
    const target = itemToRewrite || fetchedItem;
    if (!target) return;

    setIsRewritingWithAi(true);
    setRewriteSeconds(0);
    const startTimestamp = Date.now();

    rewriteIntervalRef.current = setInterval(() => {
      const elapsed = ((Date.now() - startTimestamp) / 1000).toFixed(1);
      setRewriteSeconds(parseFloat(elapsed));
    }, 100);

    try {
      const rewritten = await rewriteNewsWithServerAI(target, categories, subcategories, aiStyle, useSearchGrounding);

      if (rewriteIntervalRef.current) clearInterval(rewriteIntervalRef.current);

      setFetchedItem(rewritten);
      setActiveStoryTab('rewritten');
      setHistoryItems((prev) =>
        prev.map((item) => (item.id === rewritten.id ? rewritten : item))
      );

      const durationSec = (rewritten.rewriteDurationMs ? rewritten.rewriteDurationMs / 1000 : 1.8).toFixed(1);
      showNotification(`✨ News rewritten in ${durationSec}s with AI! ${useSearchGrounding ? '(Verified with Google Search Data)' : ''}`);
    } catch (err: any) {
      console.error('AI Rewrite Error:', err);
      setFetchError(err?.message || 'AI Rewrite encountered a temporary issue. Please try again.');
    } finally {
      if (rewriteIntervalRef.current) clearInterval(rewriteIntervalRef.current);
      setIsRewritingWithAi(false);
    }
  };

  // Execute Google Search Grounding Research
  const handleExecuteSearchGrounding = async (queryText?: string) => {
    const q = (queryText || searchTopicInput).trim();
    if (!q) return;

    setIsResearchingSearch(true);
    setGroundingError(null);
    setGroundedResult(null);

    try {
      const res = await researchTopicWithSearchGrounding(q, searchMode);
      if (!res.success) {
        throw new Error(res.error || 'Could not fetch real-time search data');
      }
      setGroundedResult({
        query: q,
        text: res.groundedText,
        sources: res.sources,
        queries: res.webSearchQueries,
      });
      showNotification(`🌐 Real-time info retrieved with Google Search Grounding (${res.sources.length} sources linked)!`);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setGroundingError(err?.message || 'Failed to retrieve real-time data. Verify OpenAI API key.');
    } finally {
      setIsResearchingSearch(false);
    }
  };

  // Convert Grounded Search to Article
  const handleConvertGroundedToArticle = async (asDraft = false) => {
    if (!groundedResult) return;
    const lines = groundedResult.text.split('\n').filter(Boolean);
    const title = lines[0]?.replace(/^[#*\s]+/, '').slice(0, 90) || groundedResult.query;
    
    const formattedParagraphs = groundedResult.text
      .split('\n\n')
      .map((p) => `<p class="mb-3 leading-relaxed">${p.replace(/^[#*\s]+/, '').trim()}</p>`)
      .join('');

    const sourceHtml = groundedResult.sources.length > 0
      ? `<div class="my-4 p-4 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40">
          <h4 class="font-bold text-sky-900 dark:text-sky-300 text-xs mb-2 flex items-center gap-1.5">
            <span>🌐</span> <span>Google Search Grounding Sources & References:</span>
          </h4>
          <ul class="list-disc list-inside space-y-1 text-xs text-sky-950 dark:text-sky-200">
            ${groundedResult.sources.map((s) => `<li><a href="${s.uri}" target="_blank" rel="noopener noreferrer" class="underline hover:text-sky-600">${s.title}</a></li>`).join('')}
          </ul>
        </div>`
      : '';

    const newItem: RawNewsItem = {
      id: `grounded-${Date.now()}`,
      source: 'custom_url',
      sourceName: 'Google Search Data',
      sourceUrl: groundedResult.sources[0]?.uri || 'https://google.com/search?q=' + encodeURIComponent(groundedResult.query),
      originalTitle: title,
      originalSummary: groundedResult.text.slice(0, 160) + '...',
      originalContent: formattedParagraphs + sourceHtml,
      originalImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
      originalPubDate: new Date().toISOString(),
      detectedCategory: 'tech',
      rewrittenTitle: title,
      rewrittenSummary: groundedResult.text.slice(0, 160) + '...',
      rewrittenContent: formattedParagraphs + sourceHtml,
      suggestedTags: ['Google Search Data', 'Real-Time News', 'गैजेट ग्लो'],
      suggestedSlug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 50) || `news-${Date.now()}`,
      targetCategoryId: categories[0]?.id || 'cat-tech',
      isRewritten: true,
      aiProvider: 'OpenAI ChatGPT',
      status: 'rewritten',
    };

    await handlePublish(newItem, asDraft);
  };

  // Publish directly to live website
  const handlePublish = async (item: RawNewsItem, asDraft = false) => {
    setPublishingId(item.id);
    try {
      const status = asDraft ? 'draft' : 'published';
      const articleData = convertToArticle(item, defaultAuthor as Author, status, false);

      // Race with timeout so UI never hangs in processing state
      const publishPromise = onPublishArticle(articleData);
      const saved = await Promise.race([
        publishPromise,
        new Promise<Article>((_, reject) =>
          setTimeout(() => reject(new Error('Publish operation took too long. Please verify your connection.')), 7000)
        ),
      ]);

      setJustPublishedArticle(saved);
      setFetchedItem((prev) => (prev ? { ...prev, status: 'published' } : null));
      setHistoryItems((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, status: 'published' } : h))
      );

      showNotification(
        asDraft
          ? 'समाचार ड्राफ्ट के रूप में सुरक्षित कर लिया गया है!'
          : `🎉 समाचार वेबसाइट पर सफलतापूर्वक लाइव प्रकाशित कर दिया गया है!`
      );
    } catch (err: any) {
      console.error('Publish error:', err);
      setFetchError(`समाचार प्रकाशित करने में त्रुटि: ${err?.message || 'कृपया पुनः प्रयास करें'}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleApplyAiImage = (newImageUrl: string) => {
    if (fetchedItem) {
      setFetchedItem((prev) => (prev ? { ...prev, originalImage: newImageUrl } : null));
      setHistoryItems((prev) =>
        prev.map((h) => (h.id === fetchedItem.id ? { ...h, originalImage: newImageUrl } : h))
      );
      showNotification('✨ AI Image Agent द्वारा नया चित्र सफलतापूर्वक खबर में जोड़ दिया गया है!');
    }
  };

  const handleQuickRegenerateImage = async () => {
    if (!fetchedItem) return;
    setIsRegeneratingImage(true);
    try {
      const res = await regenerateNewsImageWithAI(
        fetchedItem.rewrittenTitle || fetchedItem.originalTitle,
        fetchedItem.originalImage,
        fetchedItem.detectedCategory
      );
      if (res.imageUrl) {
        setFetchedItem((prev) => (prev ? { ...prev, originalImage: res.imageUrl } : null));
        setHistoryItems((prev) =>
          prev.map((h) => (h.id === fetchedItem.id ? { ...h, originalImage: res.imageUrl } : h))
        );
        showNotification(res.message || '✨ OpenAI ChatGPT / DALL-E द्वारा नया आकर्षक चित्र तैयार कर दिया गया है!');
      }
    } catch (e: any) {
      console.warn('Quick regenerate error:', e);
      showNotification('चित्र रीजेनरेट करने के लिए AI Studio Agent खोलें');
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  // Open in Article Editor Modal
  const handleOpenEditor = (item: RawNewsItem) => {
    const articleData = convertToArticle(item, defaultAuthor as Author, 'published', false);
    onOpenArticleEditor(articleData);
  };

  // Copy live link to clipboard
  const handleCopyLink = (slug: string) => {
    const liveUrl = `${window.location.origin}/news/${slug}`;
    navigator.clipboard.writeText(liveUrl);
    showNotification('लाइव लिंक क्लिपबोर्ड पर कॉपी हो गया!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 border border-slate-700/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                <Globe className="w-3 h-3" /> URL News Fetcher
              </span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> AI Instant Rewrite & Publish
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              Fetch News & Rewrite with AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              किसी भी न्यूज़ वेबसाइट (अमर उजाला, दैनिक जागरण, NDTV, BBC आदि) का लिंक पेस्ट करें। AI कुछ ही सेकंडों में पूरी खबर को नए शीर्षक, मुख्य बिंदु और पेशेवर शैली में पुनर्लेखित करेगा, जिसे आप एक क्लिक में वेबसाइट पर लाइव प्रकाशित कर सकते हैं।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Engine Speed</div>
                <div className="text-xs font-bold text-emerald-400">~2-3 Seconds</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-100 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-emerald-900/60"
          >
            हटाएं (Dismiss)
          </button>
        </div>
      )}

      {/* 2. Mode Selector: URL Fetcher vs Google Search Grounding */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Fetch News from URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search_grounding')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'search_grounding'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-black">G</span>
          <span>Google Search Data (Real-Time Search Grounding)</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Live</span>
        </button>
      </div>

      {/* TAB A: GOOGLE SEARCH GROUNDING PANEL */}
      {activeTab === 'search_grounding' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">G</span>
                <span>Access Real-Time Information with Google Search Grounding</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Google Search के लाइव वेब डेटा का उपयोग करके ताज़ा घटनाओं, बजट, तकनीक व सरकारी योजनाओं की सत्यापित जानकारी प्राप्त करें।
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 font-semibold px-2 py-1 rounded-lg">
                OpenAI ChatGPT Engine
              </span>
            </div>
          </div>

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteSearchGrounding();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-slate-750 dark:text-slate-200 mb-1.5">
                Enter Topic, Query or Breaking Event (खोजें या विषय दर्ज करें):
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  required
                  value={searchTopicInput}
                  onChange={(e) => setSearchTopicInput(e.target.value)}
                  placeholder="उदा. 'Haryana Budget 2026 tech announcements' या 'ISRO new satellite launch facts'..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="submit"
                  disabled={isResearchingSearch || !searchTopicInput.trim()}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
                >
                  {isResearchingSearch ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Google Search डेटा निकाल रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Search Live Info</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode Radios */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-500 font-semibold">Research Mode:</span>
              {[
                { id: 'news_brief', label: '📰 News Story Report' },
                { id: 'research', label: '🔍 In-Depth Research' },
                { id: 'fact_check', label: '✅ Fact-Check & Timeline' },
              ].map((m) => (
                <label key={m.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="searchMode"
                    checked={searchMode === m.id}
                    onChange={() => setSearchMode(m.id as any)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{m.label}</span>
                </label>
              ))}
            </div>

            {/* Trending Quick Topic Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Trending:</span>
              {[
                '🚀 ISRO Space Missions 2026',
                '📱 AI Flagship Smartphone Launches',
                '⚡ Electric Vehicle Subsidies in India',
                '🏛️ Haryana Government Digital Initiatives',
                '🏏 Latest Cricket Match Highlights',
                '📈 Indian Stock Market & Rupee Status',
              ].map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const clean = topic.replace(/^[^\s]+\s/, '');
                    setSearchTopicInput(clean);
                    handleExecuteSearchGrounding(clean);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </form>

          {/* Grounding Error Message */}
          {groundingError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{groundingError}</span>
            </div>
          )}

          {/* Grounding Search Result Card */}
          {groundedResult && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Google Search Grounded
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Query: {groundedResult.query}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {groundedResult.sources.length} live source references retrieved &amp; cross-verified.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConvertGroundedToArticle(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish as Live Article</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConvertGroundedToArticle(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                </div>
              </div>

              {/* Formatted Grounded Content */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {groundedResult.text}
              </div>

              {/* Web Sources & Citations */}
              {groundedResult.sources.length > 0 && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-blue-500" />
                    <span>Live Source Citations (सत्यापित स्रोत लिंक):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groundedResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <span className="truncate max-w-xs">{src.title || src.uri}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB B: MAIN URL INPUT CARD */}
      {activeTab === 'url' && (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-850 dark:text-slate-200">
                न्यूज़ आर्टिकल का URL दर्ज या पेस्ट करें (News Article Link)
              </label>
              {isFetching && (
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {fetchStatus || 'वेबसाइट से खबर निकाली जा रही है...'}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="https://www.amarujala.com/... या किसी भी न्यूज़ वेबसाइट का लिंक पेस्ट करें"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 font-mono transition-colors shadow-inner"
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('');
                      setFetchedItem(null);
                      setFetchError(null);
                      setJustPublishedArticle(null);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
                  >
                    साफ़ करें (Clear)
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isFetching || !urlInput.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shrink-0 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? 'निकाला जा रहा है...' : 'Fetch News'}</span>
              </button>
            </div>
          </div>

          {/* Quick Click Sample URLs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-500 dark:text-slate-400">त्वरित परीक्षण लिंक (One-Click Test):</span>
            {SAMPLE_NEWS_URLS.map((sample) => (
              <button
                key={sample.badge}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  performFetch(sample.url);
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-white px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
              >
                {sample.badge}
              </button>
            ))}
          </div>
        </form>

        {/* Error Alert */}
        {fetchError && (
          <div className="bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-500/50 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">सूचना (Extraction Notice)</div>
              <div className="text-red-700 dark:text-red-300/90">{fetchError}</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Success Published Live Confirmation Card */}
      {justPublishedArticle && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-2 border-emerald-500 rounded-2xl p-5 sm:p-6 text-white shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-emerald-100">
                  समाचार वेबसाइट पर प्रकाशित हो गया है! (Published Live on Website)
                </h3>
                <p className="text-xs text-emerald-300">
                  यह खबर अब लाइव होमपेज, संबंधित श्रेणी एवं सर्च में सभी पाठकों के लिए उपलब्ध है।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-800/80 text-emerald-200 text-xs px-2.5 py-1 rounded-md font-mono">
                Status: Live 🟢
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                वेबसाइट लाइव URL:
              </div>
              <div className="font-mono text-xs sm:text-sm text-white break-all select-all font-semibold">
                {window.location.origin}/news/{justPublishedArticle.slug}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(justPublishedArticle.slug)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={() => onViewLiveArticle(justPublishedArticle.slug)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>वेबसाइट पर देखें (View Live)</span>
              </button>

              <a
                href="/"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-sky-400" />
                <span>होमपेज (Home)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. Extracted & AI Rewritten Article Stage */}
      {fetchedItem && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 animate-in fade-in text-slate-900 dark:text-white">
          {/* Top Status & AI Rewrite Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-semibold border border-slate-200 dark:border-slate-700">
                स्रोत: <strong className="text-slate-900 dark:text-white">{fetchedItem.sourceName}</strong>
              </span>

              {fetchedItem.isRewritten ? (
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>AI द्वारा पुनर्लेखित ({fetchedItem.rewriteDurationMs ? `${(fetchedItem.rewriteDurationMs / 1000).toFixed(1)}s` : '2s'})</span>
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>मूल प्राप्त खबर (Raw Extracted)</span>
                </span>
              )}

              <a
                href={fetchedItem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white flex items-center gap-1 ml-1 underline"
              >
                <span>मूल लिंक (Source)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* AI Style & Search Grounding selector */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={useSearchGrounding}
                  onChange={(e) => setUseSearchGrounding(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">G</span>
                  <span>Google Search Grounding</span>
                </span>
              </label>

              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">शैली:</span>
              <select
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-red-500"
              >
                <option value="journalistic">मानक पत्रकारिता (Standard Hindi)</option>
                <option value="breaking">ब्रेकिंग न्यूज़ शैली (Breaking Alert)</option>
                <option value="investigative">गहन विश्लेषण (In-depth Report)</option>
              </select>
            </div>
          </div>

          {/* AI REWRITE CALLOUT BANNER (WHEN NOT YET REWRITTEN) */}
          {!fetchedItem.isRewritten && (
            <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border-2 border-dashed border-red-400 dark:border-red-500/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>खबर को AI से रीराइट करें (Rewrite with AI)</span>
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">1-Click</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    मूल खबर को कॉपीराइट-मुक्त, शुद्ध मानक हिंदी, 100% यूनिक शीर्षक और मुख्य बिंदुओं (Key Highlights) में 2 सेकंड में बदलें।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRewriteWithAI(fetchedItem)}
                disabled={isRewritingWithAi}
                id="rewrite-with-ai-btn"
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-70 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className={`w-4 h-4 ${isRewritingWithAi ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
                <span>
                  {isRewritingWithAi
                    ? `AI रीराइट कर रहा है (${rewriteSeconds}s)...`
                    : '✨ Rewrite with AI (AI से पुनर्लेखन करें)'}
                </span>
              </button>
            </div>
          )}

          {/* AI REWRITING IN PROGRESS INDICATOR */}
          {isRewritingWithAi && (
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 text-center space-y-3 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                  AI द्वारा समाचार का पुनर्लेखन किया जा रहा है... ({rewriteSeconds}s)
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 max-w-md mx-auto">
                  आकर्षक हिंदी शीर्षक, मुख्य बिंदु (Key Highlights), और उच्च गुणवत्ता वाला आलेख तैयार हो रहा है...
                </p>
              </div>
            </div>
          )}

          {/* Tabs for switching between Rewritten vs Original view */}
          {fetchedItem.isRewritten && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveStoryTab('rewritten')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeStoryTab === 'rewritten'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>✨ AI Rewritten Story (प्रकाशित करने हेतु तैयार)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStoryTab('original')}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeStoryTab === 'original'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <span>मूल कच्ची खबर (Original Extracted)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleRewriteWithAI(fetchedItem)}
                disabled={isRewritingWithAi}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 py-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>फिर से रीराइट करें (Re-generate)</span>
              </button>
            </div>
          )}

          {/* Story Body View */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Featured Image */}
            <div className="md:col-span-4 space-y-3">
              <div className="aspect-16/10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative group">
                <img
                  src={fetchedItem.originalImage}
                  alt={fetchedItem.originalTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                चित्र स्रोत: {fetchedItem.originalImage.slice(0, 50)}...
              </div>

              {/* AI Image Agent Box (Requirement 2) */}
              <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-rose-500/10 border-2 border-purple-300 dark:border-purple-800/80 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Image Agent</span>
                  </span>
                  <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                    Smart Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  इस URL की इमेज के समान नया कॉपीराइट-मुक्त चित्र बनाएं या ब्रेकिंग न्यूज़ रिबन व स्टैम्प लगाएं:
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleQuickRegenerateImage}
                    disabled={isRegeneratingImage}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
                    <span>{isRegeneratingImage ? 'OpenAI DALL-E चित्र बना रहा है...' : '🔄 Regenerate Image with ChatGPT'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImageAgentOpen(true)}
                    className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-2.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-purple-500" />
                    <span>🎨 Open AI Image Studio Agent & Filters</span>
                  </button>
                </div>
              </div>

              {/* Categorization details */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">श्रेणी (Category):</span>
                  <span className="font-bold text-red-600 capitalize">{fetchedItem.detectedCategory}</span>
                </div>
                {fetchedItem.detectedDistrict && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">जिला (District):</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{fetchedItem.detectedDistrict}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">लेखक (Author):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{defaultAuthor.name}</span>
                </div>
              </div>
            </div>

            {/* Headline and Summary */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                  {activeStoryTab === 'rewritten' ? '✨ AI REWRITTEN HEADLINE' : 'ORIGINAL EXTRACTED HEADLINE'}
                </div>
                <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
                  {activeStoryTab === 'rewritten'
                    ? fetchedItem.rewrittenTitle || fetchedItem.originalTitle
                    : fetchedItem.originalTitle}
                </h2>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {activeStoryTab === 'rewritten' ? '✨ AI LEAD SUMMARY' : 'EXTRACTED SUMMARY'}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  {activeStoryTab === 'rewritten'
                    ? fetchedItem.rewrittenSummary || fetchedItem.originalSummary
                    : fetchedItem.originalSummary}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  SEO Tags & Keywords:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(fetchedItem.suggestedTags || ['ताजा खबर', 'गैजेट ग्लो']).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Complete Story Content Section (Prominently displayed) */}
          {(() => {
            const currentContent =
              activeStoryTab === 'rewritten'
                ? fetchedItem.rewrittenContent || fetchedItem.originalContent
                : fetchedItem.originalContent;
            const paragraphMatches = currentContent ? (currentContent.match(/<p/gi) || []).length : 0;
            const approxWords = currentContent ? currentContent.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length : 0;

            return (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {activeStoryTab === 'rewritten' ? '✨ सम्पूर्ण AI पुनर्लेखित समाचार' : '📰 सम्पूर्ण समाचार विवरण (Complete Story)'}
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{paragraphMatches > 0 ? `${paragraphMatches} पैराग्राफ` : 'पूर्ण आलेख'}</span>
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      ~{approxWords} शब्द
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewContentExpanded(!previewContentExpanded)}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-white font-medium flex items-center gap-1 py-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewContentExpanded ? 'संक्षिप्त करें' : 'विस्तार से देखें'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditor(fetchedItem)}
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1 py-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>एडिटर में खोलें</span>
                    </button>
                  </div>
                </div>

                {previewContentExpanded && (
                  <div
                    className="p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 space-y-3.5 max-h-96 overflow-y-auto font-sans leading-relaxed shadow-inner"
                    dangerouslySetInnerHTML={{
                      __html: currentContent || '<p>कोई समाचार सामग्री उपलब्ध नहीं है।</p>',
                    }}
                  />
                )}
              </div>
            );
          })()}

          {/* ACTION BUTTONS & PUBLISH TO WEBSITE OPTION */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {fetchedItem.isRewritten ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>खबर वेबसाइट पर प्रकाशित करने के लिए तैयार है!</span>
                </span>
              ) : (
                <span>सुझाव: पहले "Rewrite with AI" करें, फिर प्रकाशित करें।</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {/* If not rewritten yet, show prominent rewrite button */}
              {!fetchedItem.isRewritten && (
                <button
                  type="button"
                  onClick={() => handleRewriteWithAI(fetchedItem)}
                  disabled={isRewritingWithAi}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-75 text-slate-950 font-bold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isRewritingWithAi ? 'animate-spin text-red-950' : ''}`} />
                  <span>{isRewritingWithAi ? `⚡ Rewriting (${rewriteSeconds}s)...` : '✨ Rewrite with ChatGPT (1-2s)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handlePublish(fetchedItem, true)}
                disabled={publishingId === fetchedItem.id}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                ड्राफ्ट बनाएं (Save Draft)
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditor(fetchedItem)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>एडिटर में खोलें (Edit)</span>
              </button>

              {/* PROMINENT OPTION TO PUBLISH NEWS ON WEBSITE */}
              <button
                type="button"
                id="publish-news-to-website-btn"
                onClick={() => handlePublish(fetchedItem, false)}
                disabled={publishingId === fetchedItem.id}
                className={`bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:bg-slate-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  fetchedItem.isRewritten ? 'ring-4 ring-emerald-500/20 shadow-red-600/30 text-sm py-3 px-7 scale-102' : ''
                }`}
              >
                <Send className={`w-4 h-4 ${publishingId === fetchedItem.id ? 'animate-spin' : ''}`} />
                <span>
                  {publishingId === fetchedItem.id
                    ? 'प्रकाशित हो रहा है...'
                    : '🚀 Publish News on Website (वेबसाइट पर प्रकाशित करें)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Session History List */}
      {historyItems.length > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              इस सत्र में निकाली गई खबरें ({historyItems.length})
            </h3>
            <button
              onClick={() => setHistoryItems([])}
              className="text-[11px] text-slate-500 hover:text-red-500 cursor-pointer"
            >
              इतिहास साफ़ करें (Clear History)
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {historyItems.map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                    <img src={item.originalImage} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-md">
                      {item.rewrittenTitle || item.originalTitle}
                    </h4>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>स्रोत: {item.sourceName}</span>
                      <span>•</span>
                      <span className="capitalize text-red-600">{item.detectedCategory}</span>
                      {item.isRewritten && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> AI Rewritten
                        </span>
                      )}
                      {item.status === 'published' && (
                        <span className="text-emerald-600 font-bold">• Live Published</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setFetchedItem(item);
                      setUrlInput(item.sourceUrl);
                      setActiveStoryTab(item.isRewritten ? 'rewritten' : 'original');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    लोड करें
                  </button>

                  {!item.isRewritten && (
                    <button
                      onClick={() => handleRewriteWithAI(item)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Rewrite
                    </button>
                  )}

                  {item.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(item, false)}
                      disabled={publishingId === item.id}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-bold cursor-pointer"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* AI Image Agent Modal (Requirement 2) */}
      {fetchedItem && (
        <AiImageAgentModal
          isOpen={isImageAgentOpen}
          onClose={() => setIsImageAgentOpen(false)}
          initialImageUrl={fetchedItem.originalImage}
          initialHeadline={fetchedItem.rewrittenTitle || fetchedItem.originalTitle}
          category={fetchedItem.detectedCategory}
          onApplyImage={handleApplyAiImage}
        />
      )}
    </div>
  );
};
