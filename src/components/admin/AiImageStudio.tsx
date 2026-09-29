import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  Layers,
  Download,
  Image as ImageIcon,
  Check,
  RotateCw,
  RefreshCw,
  Sliders,
  Send,
  PlusCircle,
  Copy,
  ExternalLink,
  Bot,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Article } from '../../types';
import { AiModelSettingsModal } from './AiModelSettingsModal';

interface AiImageStudioProps {
  articles?: Article[];
  onOpenArticleEditor?: (article: Partial<Article>) => void;
  onNavigateAiSettings?: () => void;
}

export type ModificationStyle =
  | 'breaking_ribbon'
  | 'tech_glow'
  | 'cinematic'
  | 'exclusive_badge'
  | 'trending_hot'
  | 'monochrome_news';

const TOPIC_PRESETS = [
  { label: '📱 Flagship Smartphone', prompt: 'Close up sleek futuristic smartphone with glowing edge display and metallic finish, high-tech desk' },
  { label: '🤖 AI & Neural Tech', prompt: 'Artificial intelligence glowing neural brain network and microchips, cinematic cyberpunk lighting' },
  { label: '⚡ EV & Supercar', prompt: 'Modern electric futuristic automobile with LED headlights in a high-tech illuminated showroom' },
  { label: '💻 Laptop & Workstation', prompt: 'Ultra-thin modern developer workstation with triple curved monitors and ambient lighting' },
  { label: '🏛️ Indian Parliament / Govt', prompt: 'Grand Indian Parliament building exterior at twilight with dramatic sky, dignified news journalism' },
  { label: '🏏 Cricket Stadium Night', prompt: 'Massive floodlit cricket stadium packed with crowd at night, cinematic dramatic sports action' },
  { label: '🌦️ Weather & Monsoon', prompt: 'Dramatic monsoon storm clouds over an Indian city skyline with lightning, atmospheric news photo' },
  { label: '🔒 Cyber Security', prompt: 'Digital cyber security lock hologram over global fiber optic network, high tech blue matrix' },
  { label: '🚀 Space & Satellite', prompt: 'High-tech satellite in Earth orbit with shimmering blue horizon and stars, scientific news' },
  { label: '📈 Stock Market & Rupee', prompt: 'Bull statue and glowing financial stock charts on digital display screens, business news' },
];

export const AiImageStudio: React.FC<AiImageStudioProps> = ({
  articles = [],
  onOpenArticleEditor,
  onNavigateAiSettings,
}) => {
  const [headline, setHeadline] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [mode, setMode] = useState<'generate' | 'edit' | 'similar' | 'modify'>('generate');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [imageSize, setImageSize] = useState<'512px' | '1K' | '2K' | '4K'>('1K');
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [modStyle, setModStyle] = useState<ModificationStyle>('breaking_ribbon');
  const [badgeText, setBadgeText] = useState('ब्रेकिंग न्यूज़ | GADGET GLOW EXCLUSIVE');
  const [includeHeadlineOverlay, setIncludeHeadlineOverlay] = useState(true);

  // Model Selection: OpenAI ChatGPT (DALL-E 3)
  const [aiProvider, setAiProvider] = useState<'chatgpt'>('chatgpt');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80'
  );
  const [history, setHistory] = useState<string[]>([
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
  ]);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeModelLabel, setActiveModelLabel] = useState<string>('OpenAI ChatGPT (DALL-E 3)');

  // Load AI configuration to check keys
  const loadConfig = () => {
    fetch('/api/ai/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasOpenAiKey(Boolean(data.hasOpenAiKey));
          setAiProvider('chatgpt');
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Safe canvas compositing with permissive server CORS proxy
  const applyCanvasModifications = useCallback(
    async (
      imgSrc: string,
      styleToApply: ModificationStyle,
      ribbonText: string,
      newsTitle: string,
      showTitle: boolean
    ): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const safeSrc = imgSrc.startsWith('http')
          ? `/api/ai/proxy-image?url=${encodeURIComponent(imgSrc)}`
          : imgSrc;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(imgSrc);

          const targetW = aspectRatio === '4:3' ? 1024 : aspectRatio === '1:1' ? 900 : 1280;
          const targetH = aspectRatio === '4:3' ? 768 : aspectRatio === '1:1' ? 900 : 720;
          canvas.width = targetW;
          canvas.height = targetH;

          // Draw image centered cover
          const hRatio = targetW / img.width;
          const vRatio = targetH / img.height;
          const ratio = Math.max(hRatio, vRatio);
          const shiftX = (targetW - img.width * ratio) / 2;
          const shiftY = (targetH - img.height * ratio) / 2;
          ctx.drawImage(img, 0, 0, img.width, img.height, shiftX, shiftY, img.width * ratio, img.height * ratio);

          if (styleToApply === 'breaking_ribbon') {
            // Dark gradient base
            const grad = ctx.createLinearGradient(0, targetH * 0.55, 0, targetH);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.65)');
            grad.addColorStop(1, 'rgba(0,0,0,0.95)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, targetH * 0.55, targetW, targetH * 0.45);

            // Red ticker ribbon
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, targetH - 110, targetW, 42);

            // Live white dot
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(50, targetH - 89, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(ribbonText || 'ब्रेकिंग न्यूज़ | GADGET GLOW EXCLUSIVE', 68, targetH - 83);

            if (showTitle && newsTitle) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 22px sans-serif';
              ctx.fillText(newsTitle.slice(0, 68) + (newsTitle.length > 68 ? '...' : ''), 40, targetH - 35);
            }
          } else if (styleToApply === 'tech_glow') {
            const grad = ctx.createRadialGradient(targetW / 2, targetH / 2, targetW * 0.15, targetW / 2, targetH / 2, targetW * 0.75);
            grad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
            grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.35)');
            grad.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
            ctx.lineWidth = 4;
            ctx.strokeRect(16, 16, targetW - 32, targetH - 32);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(40, 40, 220, 40);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 40, 220, 40);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('⚡ GADGET GLOW TECH', 52, 65);
          } else if (styleToApply === 'cinematic') {
            const grad = ctx.createLinearGradient(0, 0, 0, targetH);
            grad.addColorStop(0, 'rgba(0,0,0,0.5)');
            grad.addColorStop(0.2, 'rgba(0,0,0,0.05)');
            grad.addColorStop(0.8, 'rgba(0,0,0,0.2)');
            grad.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetW, 40);
            ctx.fillRect(0, targetH - 40, targetW, 40);

            ctx.fillStyle = '#ffffff';
            ctx.font = '600 13px sans-serif';
            ctx.fillText('GADGET GLOW CINEMATIC JOURNALISM', 40, targetH - 16);
          } else if (styleToApply === 'exclusive_badge') {
            const grad = ctx.createRadialGradient(targetW / 2, targetH / 2, targetW * 0.3, targetW / 2, targetH / 2, targetW * 0.75);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(36, 36, 260, 46);
            ctx.fillStyle = '#0f172a';
            ctx.font = '900 16px sans-serif';
            ctx.fillText('★ GADGET GLOW SPECIAL', 50, 65);
          } else if (styleToApply === 'trending_hot') {
            const grad = ctx.createLinearGradient(0, targetH - 80, targetW, targetH);
            grad.addColorStop(0, '#f97316');
            grad.addColorStop(1, '#ef4444');
            ctx.fillStyle = grad;
            ctx.fillRect(0, targetH - 80, targetW, 80);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('🔥 ट्रेंडिंग न्यूज़ | TRENDING STORY', 40, targetH - 45);

            if (showTitle && newsTitle) {
              ctx.font = '500 16px sans-serif';
              ctx.fillText(newsTitle.slice(0, 75), 40, targetH - 18);
            }
          } else if (styleToApply === 'monochrome_news') {
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const highContrast = gray > 128 ? Math.min(255, gray * 1.08) : Math.max(0, gray * 0.92);
              data[i] = highContrast;
              data[i + 1] = highContrast;
              data[i + 2] = highContrast;
            }
            ctx.putImageData(imgData, 0, 0);

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(30, 30, 220, 36);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('PHOTOJOURNALISM ARCHIVE', 42, 53);
          }

          try {
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch (e) {
            console.warn('Canvas export warning, returning safe source:', e);
            resolve(safeSrc);
          }
        };

        img.onerror = () => resolve(imgSrc);
        img.src = safeSrc;
      });
    },
    [aspectRatio]
  );

  // Trigger Live Canvas preview update when in 'modify' mode
  const handleLiveModifyPreview = async (newStyle?: ModificationStyle) => {
    const activeStyle = newStyle || modStyle;
    const base = referenceUrl || currentImage || history[0];
    if (base) {
      const modified = await applyCanvasModifications(
        base,
        activeStyle,
        badgeText,
        headline,
        includeHeadlineOverlay
      );
      setCurrentImage(modified);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const providerTitle = 'OpenAI ChatGPT (DALL-E 3)';
    setStatusMsg(`Connecting with ${providerTitle}...`);

    try {
      let finalPrompt = customPrompt;
      if (mode === 'edit') {
        finalPrompt = editInstructions || customPrompt || 'Modify and enhance this image with high-definition journalistic details';
      } else if (mode === 'similar') {
        finalPrompt = `High-definition journalistic news photograph similar to story: ${headline || 'Latest breaking news'}`;
      } else if (mode === 'modify') {
        finalPrompt = `Editorial news photo with ${modStyle} style for headline: ${headline}`;
      } else if (!finalPrompt) {
        finalPrompt = headline || 'High-definition technology news journalism photograph';
      }

      const res = await fetch('/api/ai/image-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiProvider,
          mode,
          prompt: finalPrompt,
          headline,
          referenceImageUrl: referenceUrl,
          aspectRatio,
          imageSize,
          style: modStyle,
          useSearchGrounding,
          editInstructions,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server responded with error status ${res.status}`);
      }

      if (data.success && data.imageUrl) {
        let finalUrl = data.imageUrl;

        // Apply client canvas modifications if in modify mode
        if (mode === 'modify') {
          finalUrl = await applyCanvasModifications(
            finalUrl,
            modStyle,
            badgeText,
            headline,
            includeHeadlineOverlay
          );
        }

        setCurrentImage(finalUrl);
        setHistory((prev) => [finalUrl, ...prev.filter((i) => i !== finalUrl)].slice(0, 16));
        setActiveModelLabel(data.provider || providerTitle);
        setStatusMsg(data.message || `✨ Image generated successfully with ${providerTitle}!`);
      }
    } catch (err: any) {
      console.warn('AI Image Generation error:', err);
      setErrorMsg(err?.message || 'Generation failed. Please verify your API Key in Settings.');
      // If error, generate canvas fallback so user can still preview
      try {
        const base = referenceUrl || history[0];
        const fallbackUrl = await applyCanvasModifications(
          base,
          modStyle,
          badgeText,
          headline,
          includeHeadlineOverlay
        );
        setCurrentImage(fallbackUrl);
        setHistory((prev) => [fallbackUrl, ...prev].slice(0, 16));
      } catch (canvasErr) {
        console.warn('Canvas fallback failed:', canvasErr);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `gadget-glow-ai-${aiProvider}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCreateArticleWithImage = (url: string) => {
    if (onOpenArticleEditor) {
      onOpenArticleEditor({
        title: headline || 'नई टेक खबर | Gadget Glow Exclusive',
        featuredImage: url,
        shortDescription: 'AI इमेज स्टूडियो एजेंट द्वारा तैयार उच्च गुणवत्ता वाली विशेष खबर।',
        categoryName: 'Technology',
        categoryId: 'cat-tech',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                AI Studio
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                OpenAI ChatGPT &amp; DALL-E 3
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>AI Image Studio Agent</span>
              <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              OpenAI ChatGPT व DALL-E 3 से सिमिलर इमेज बनाएं, ब्रेकिंग न्यूज़ स्टाइल रिबन लगाएं, या नए प्रॉम्ट से 4K हाई-डेफिनिशन फ़ोटो तैयार करें।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-800/90 hover:bg-slate-700 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>Configure AI Keys &amp; Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Model Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Active AI Engine:
          </span>
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs">
            <Bot className="w-4 h-4 text-emerald-500" />
            <span>OpenAI ChatGPT &amp; DALL-E 3</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">Key Status:</span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              hasOpenAiKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
            }`}
          >
            {hasOpenAiKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OpenAI Key Ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>OpenAI Key Optional</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 3. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Creator */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Studio Module (मोड चुनें)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('generate')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'generate'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Image</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'edit'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Edit Image</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('similar')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'similar'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Similar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('modify');
                  handleLiveModifyPreview();
                }}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'modify'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overlays</span>
              </button>
            </div>
          </div>

          {/* Headline Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              News Headline or Story Topic (संदर्भ शीर्षक)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                if (mode === 'modify') handleLiveModifyPreview();
              }}
              placeholder="e.g. Apple unveils next-gen M4 chip and iPad Pro..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* MODULE: EDIT IMAGE WITH NANO BANANA 2 */}
          {mode === 'edit' && (
            <div className="space-y-3.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-300 dark:border-indigo-800/60 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                  <span>Edit Image with Nano Banana 2</span>
                </span>
                <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Fast Multimodal Editing
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                मौजूदा इमेज को चुनें या उसका URL डालें, और Nano Banana 2 को बताएं कि इमेज में क्या बदलाव करना है (उदा. बैकग्राउंड बदलें, नियॉन लाइटिंग लगाएं, या आधुनिक स्टूडियो का रूप दें)।
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Image to Edit (स्रोत इमेज URL):
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://... URL of image to edit"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Quick Pick from History / Current */}
              {history.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Or select an existing visual:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {history.slice(0, 5).map((imgUrl, i) => (
                      <div
                        key={i}
                        onClick={() => setReferenceUrl(imgUrl)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                          referenceUrl === imgUrl ? 'border-indigo-600 shadow-md ring-2 ring-indigo-400' : 'border-slate-300 dark:border-slate-700 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Editing Instructions for Nano Banana 2 (क्या बदलाव करना है):
                </label>
                <textarea
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="e.g. Add glowing futuristic neon edges to the phone, and change the background to an ultra-modern news studio with ambient blue lighting."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Quick Edit Suggestion Pills */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quick Edit Suggestions:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '⚡ Neon Cyberpunk Accents', text: 'Add sharp glowing neon cyan and magenta cyber accents with high-tech hologram HUD overlay.' },
                    { label: '🎙️ Modern Newsroom Backdrop', text: 'Replace background with an illuminated high-tech television news studio with glowing screens.' },
                    { label: '🌅 Golden Hour Lighting', text: 'Enhance lighting with warm cinematic sunset golden hour glow and deep editorial contrast.' },
                    { label: '📱 Holographic AR Screen', text: 'Add a floating transparent futuristic holographic user interface screen in front.' },
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditInstructions(pill.text)}
                      className="bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 1: SIMILAR IMAGE MODULE */}
          {mode === 'similar' && (
            <div className="space-y-3.5 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>Similar Image Generation Module</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                AI analyzes your reference image and story headline to synthesize a fresh, copyright-free high-resolution photojournalistic visual.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference Image URL:
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://... URL of reference photo"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              {/* Quick Pick from Recent Articles */}
              {articles.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Or Pick from Recent Articles:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {articles.slice(0, 5).map((art) => (
                      <div
                        key={art.id}
                        onClick={() => {
                          setReferenceUrl(art.featuredImage);
                          setHeadline(art.title);
                        }}
                        className="w-20 shrink-0 cursor-pointer group"
                      >
                        <div className="aspect-16/10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-purple-500">
                          <img
                            src={art.featuredImage}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[9px] truncate text-slate-500 mt-1">{art.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODULE 2: MODIFY / STYLE CHANGES MODULE */}
          {mode === 'modify' && (
            <div className="space-y-3.5 bg-red-500/5 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-red-600" />
                  <span>Modify &amp; Style Changes Module</span>
                </span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Real-time Live Canvas
                </span>
              </div>

              {/* Style Choices */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'breaking_ribbon', label: '🚨 Breaking Ribbon', desc: 'Red bottom ticker' },
                  { id: 'tech_glow', label: '⚡ Tech Glow &amp; Border', desc: 'Cyan futuristic finish' },
                  { id: 'cinematic', label: '🎬 Cinematic Bars', desc: 'Letterbox dark bars' },
                  { id: 'exclusive_badge', label: '⭐ Exclusive Scoop', desc: 'Golden special stamp' },
                  { id: 'trending_hot', label: '🔥 Trending Hot', desc: 'Fiery gradient ribbon' },
                  { id: 'monochrome_news', label: '📷 Classic B&amp;W', desc: 'High contrast print' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setModStyle(s.id as ModificationStyle);
                      handleLiveModifyPreview(s.id as ModificationStyle);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      modStyle === s.id
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs" dangerouslySetInnerHTML={{ __html: s.label }} />
                    <div className="text-[10px] opacity-80 mt-0.5" dangerouslySetInnerHTML={{ __html: s.desc }} />
                  </button>
                ))}
              </div>

              {/* Ribbon Text Input */}
              {(modStyle === 'breaking_ribbon' || modStyle === 'trending_hot') && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Ticker Ribbon Text:
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => {
                      setBadgeText(e.target.value);
                      handleLiveModifyPreview();
                    }}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={includeHeadlineOverlay}
                      onChange={(e) => {
                        setIncludeHeadlineOverlay(e.target.checked);
                        handleLiveModifyPreview();
                      }}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      चित्र के नीचे समाचार का मुख्य शीर्षक भी प्रिंट करें
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* MODULE 3: NEW PROMPT IMAGE GENERATION */}
          {mode === 'generate' && (
            <div className="space-y-3.5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>New Prompt Image Generation Module</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Visual Prompt Description
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the image you want AI to generate (e.g. Flagship futuristic smartphone with glowing holographic display on dark oak desk...)"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 leading-relaxed"
                />
              </div>

              {/* Presets */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Trending Presets:
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {TOPIC_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomPrompt(preset.prompt)}
                      className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Aspect Ratio (आकार अनुपात)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: '16:9', desc: 'News Article Banner' },
                { id: '4:3', label: '4:3', desc: 'Thumbnail Grid' },
                { id: '1:1', label: '1:1', desc: 'Square Social' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id as any)}
                  className={`p-2 rounded-xl text-center border transition-colors cursor-pointer ${
                    aspectRatio === r.id
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="text-xs">{r.label}</div>
                  <div className="text-[10px] opacity-80">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>
                  {aiProvider === 'chatgpt' ? 'ChatGPT (DALL-E 3) बना रहा है...' : 'Nano Banana 2 चित्र बना रहा है...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {mode === 'edit'
                    ? `Edit Image with ${aiProvider === 'chatgpt' ? 'ChatGPT' : 'Nano Banana 2'}`
                    : mode === 'similar'
                    ? `Generate Similar Image with ${aiProvider === 'chatgpt' ? 'ChatGPT' : 'Nano Banana 2'}`
                    : mode === 'modify'
                    ? 'Apply Modifications & Style Enhance'
                    : `Generate Image with ${aiProvider === 'chatgpt' ? 'ChatGPT (DALL-E 3)' : 'Nano Banana 2'}`}
                </span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{errorMsg}</span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="block text-purple-600 dark:text-purple-400 underline font-semibold mt-1"
                >
                  Click here to check/update API Keys &amp; Models
                </button>
              </div>
            </div>
          )}

          {statusMsg && !errorMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Canvas & History Gallery */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Preview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                Current Output Image ({activeModelLabel})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {aspectRatio === '16:9' ? '1280x720 • HD' : aspectRatio === '4:3' ? '1024x768 • HD' : '900x900 • Square'}
              </span>
            </div>

            <div
              className={`rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group flex items-center justify-center ${
                aspectRatio === '16:9' ? 'aspect-16/9' : aspectRatio === '4:3' ? 'aspect-4/3' : 'aspect-square'
              }`}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="AI Generated"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">क्लिक करें बाईं ओर बटन पर चित्र तैयार करने के लिए</p>
                </div>
              )}

              {/* Badge overlay showing provider */}
              {currentImage && (
                <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-md">
                  {activeModelLabel}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {currentImage && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCreateArticleWithImage(currentImage)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Article with this Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('similar');
                    handleGenerate();
                  }}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>🔄 Regenerate Variation</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(currentImage)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res</span>
                </button>
              </div>
            )}
          </div>

          {/* Generated Gallery Carousel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Recent AI Generated Gallery (Click to Inspect / Apply)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {history.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentImage(imgUrl);
                    if (mode === 'similar') setReferenceUrl(imgUrl);
                  }}
                  className={`aspect-16/10 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-102 ${
                    currentImage === imgUrl
                      ? 'border-purple-600 ring-2 ring-purple-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumb ${index}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Key & Model Settings Modal */}
      <AiModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          loadConfig();
        }}
        onConfigUpdated={(prov) => {
          setAiProvider(prov);
          loadConfig();
        }}
      />
    </div>
  );
};
