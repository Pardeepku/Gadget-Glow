import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Sliders,
  Check,
  RotateCw,
  Download,
  X,
  Layers,
  Zap,
  Flame,
  Sun,
  Camera,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Bot,
  Settings2,
  CheckCircle2,
} from 'lucide-react';
import { AiModelSettingsModal } from './AiModelSettingsModal';

export interface AiImageAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  initialHeadline?: string;
  category?: string;
  onApplyImage: (generatedImageUrl: string) => void;
}

export type ImageAgentMode = 'similar' | 'modify' | 'generate' | 'regenerate';
export type AspectRatioType = '16:9' | '4:3' | '1:1';
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
  { label: '🌦️ Weather & Cloudburst', prompt: 'Dramatic monsoon storm clouds over an Indian city skyline with lightning, atmospheric news photo' },
  { label: '🔒 Cyber Security', prompt: 'Digital cyber security lock hologram over global fiber optic network, high tech blue matrix' },
];

export const AiImageAgentModal: React.FC<AiImageAgentModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  initialHeadline = '',
  category = 'tech',
  onApplyImage,
}) => {
  const [mode, setMode] = useState<ImageAgentMode>(initialImageUrl ? 'similar' : 'generate');
  const [headline, setHeadline] = useState(initialHeadline);
  const [referenceUrl, setReferenceUrl] = useState(initialImageUrl || '');
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [activeModStyle, setActiveModStyle] = useState<ModificationStyle>('breaking_ribbon');
  const [badgeText, setBadgeText] = useState('ब्रेकिंग न्यूज़ | GADGET GLOW EXCLUSIVE');
  const [includeHeadlineOverlay, setIncludeHeadlineOverlay] = useState(true);
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [imageSize, setImageSize] = useState<'512px' | '1K' | '2K' | '4K'>('1K');

  // Model selection: OpenAI ChatGPT (DALL-E 3)
  const [aiProvider, setAiProvider] = useState<'chatgpt'>('chatgpt');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(initialImageUrl || null);
  const [generationLog, setGenerationLog] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [modelLabel, setModelLabel] = useState<string>('OpenAI ChatGPT (DALL-E 3)');

  // Pre-fetch AI config to know default provider
  useEffect(() => {
    fetch('/api/ai/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.defaultProvider) {
          setAiProvider(data.defaultProvider);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialImageUrl) {
      setReferenceUrl(initialImageUrl);
      setResultImageUrl(initialImageUrl);
      setMode('similar');
    }
    if (initialHeadline) {
      setHeadline(initialHeadline);
    }
  }, [initialImageUrl, initialHeadline]);

  // Safe canvas compositing with server proxy (Eliminates CORS taint)
  const applyCanvasModifications = useCallback(
    async (
      imgSrc: string,
      modStyle: ModificationStyle,
      ribbonText: string,
      newsTitle: string,
      showHeadlineText: boolean
    ): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Load via permissive CORS proxy if external URL
        const safeSrc = imgSrc.startsWith('http')
          ? `/api/ai/proxy-image?url=${encodeURIComponent(imgSrc)}`
          : imgSrc;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(imgSrc);

          let targetW = 1280;
          let targetH = 720;
          if (aspectRatio === '4:3') {
            targetW = 1024;
            targetH = 768;
          } else if (aspectRatio === '1:1') {
            targetW = 900;
            targetH = 900;
          }

          canvas.width = targetW;
          canvas.height = targetH;

          // Draw image centered cover
          const hRatio = targetW / img.width;
          const vRatio = targetH / img.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShiftX = (targetW - img.width * ratio) / 2;
          const centerShiftY = (targetH - img.height * ratio) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            centerShiftX,
            centerShiftY,
            img.width * ratio,
            img.height * ratio
          );

          // Apply selected visual style
          if (modStyle === 'tech_glow') {
            // High-tech Cyan/Indigo vignette & glowing frame
            const grad = ctx.createRadialGradient(
              targetW / 2,
              targetH / 2,
              targetW * 0.15,
              targetW / 2,
              targetH / 2,
              targetW * 0.75
            );
            grad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
            grad.addColorStop(0.65, 'rgba(15, 23, 42, 0.35)');
            grad.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            // Glowing cyan border lines
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
            ctx.lineWidth = 4;
            ctx.strokeRect(16, 16, targetW - 32, targetH - 32);

            // Tech badge
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(40, 40, 220, 40);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 40, 220, 40);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('⚡ GADGET GLOW TECH', 52, 65);
          } else if (modStyle === 'cinematic') {
            // Cinematic Letterbox & contrast grading
            const grad = ctx.createLinearGradient(0, 0, 0, targetH);
            grad.addColorStop(0, 'rgba(0,0,0,0.5)');
            grad.addColorStop(0.2, 'rgba(0,0,0,0.05)');
            grad.addColorStop(0.8, 'rgba(0,0,0,0.2)');
            grad.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            // Letterbox bars
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, targetW, 40);
            ctx.fillRect(0, targetH - 40, targetW, 40);

            ctx.fillStyle = '#ffffff';
            ctx.font = '600 13px sans-serif';
            ctx.fillText('GADGET GLOW CINEMATIC JOURNALISM', 40, targetH - 16);
          } else if (modStyle === 'breaking_ribbon') {
            // Bottom dramatic dark gradient
            const grad = ctx.createLinearGradient(0, targetH * 0.55, 0, targetH);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.65)');
            grad.addColorStop(1, 'rgba(0,0,0,0.95)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, targetH * 0.55, targetW, targetH * 0.45);

            // Red breaking ribbon
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(0, targetH - 110, targetW, 42);

            // Breaking live pulse indicator
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(50, targetH - 89, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Mukta, sans-serif';
            ctx.fillText(ribbonText || 'ब्रेकिंग न्यूज़ | GADGET GLOW EXCLUSIVE', 68, targetH - 83);

            // Headline banner text
            if (showHeadlineText && newsTitle) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 22px Mukta, sans-serif';
              ctx.fillText(
                newsTitle.slice(0, 68) + (newsTitle.length > 68 ? '...' : ''),
                40,
                targetH - 35
              );
            }
          } else if (modStyle === 'exclusive_badge') {
            // Subtle dark edge vignette
            const grad = ctx.createRadialGradient(
              targetW / 2,
              targetH / 2,
              targetW * 0.3,
              targetW / 2,
              targetH / 2,
              targetW * 0.75
            );
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, 'rgba(0,0,0,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, targetW, targetH);

            // Golden exclusive badge
            const badgeW = 260;
            const badgeH = 46;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(36, 36, badgeW, badgeH);
            ctx.fillStyle = '#0f172a';
            ctx.font = '900 16px sans-serif';
            ctx.fillText('★ GADGET GLOW SPECIAL', 50, 65);
          } else if (modStyle === 'trending_hot') {
            // Fiery orange/red gradient bottom bar
            const grad = ctx.createLinearGradient(0, targetH - 80, targetW, targetH);
            grad.addColorStop(0, '#f97316');
            grad.addColorStop(1, '#ef4444');
            ctx.fillStyle = grad;
            ctx.fillRect(0, targetH - 80, targetW, 80);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px Mukta, sans-serif';
            ctx.fillText('🔥 ट्रेंडिंग न्यूज़ | TRENDING STORY', 40, targetH - 45);

            if (showHeadlineText && newsTitle) {
              ctx.font = '500 16px Mukta, sans-serif';
              ctx.fillText(newsTitle.slice(0, 75), 40, targetH - 18);
            }
          } else if (modStyle === 'monochrome_news') {
            // Black and white journalistic high-contrast
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              // boost contrast
              const highContrast = gray > 128 ? Math.min(255, gray * 1.08) : Math.max(0, gray * 0.92);
              data[i] = highContrast;
              data[i + 1] = highContrast;
              data[i + 2] = highContrast;
            }
            ctx.putImageData(imgData, 0, 0);

            // Stamp
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(30, 30, 210, 36);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('PHOTOJOURNALISM ARCHIVE', 42, 53);
          }

          try {
            resolve(canvas.toDataURL('image/jpeg', 0.92));
          } catch (e) {
            console.warn('Canvas export warning:', e);
            resolve(imgSrc);
          }
        };

        img.onerror = () => {
          console.warn('Image load failed in canvas mod, using original');
          resolve(imgSrc);
        };
        img.src = safeSrc;
      });
    },
    [aspectRatio]
  );

  if (!isOpen) return null;

  // Main Generation Handler for all 3 modules
  const updateLiveCanvasPreview = useCallback(
    async (
      styleToUse: ModificationStyle = activeModStyle,
      textToUse: string = badgeText,
      headlineToUse: string = headline,
      showHeadlineToUse: boolean = includeHeadlineOverlay
    ) => {
      const base = referenceUrl || resultImageUrl || initialImageUrl;
      if (base) {
        const modified = await applyCanvasModifications(
          base,
          styleToUse,
          textToUse,
          headlineToUse,
          showHeadlineToUse
        );
        setResultImageUrl(modified);
      }
    },
    [activeModStyle, badgeText, headline, includeHeadlineOverlay, referenceUrl, resultImageUrl, initialImageUrl, applyCanvasModifications]
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setAppliedSuccess(false);

    const providerName = 'OpenAI ChatGPT (DALL-E 3)';
    setGenerationLog(`AI Agent connecting with ${providerName}...`);

    try {
      let finalPrompt = customPrompt;
      if (mode === 'similar') {
        finalPrompt = `High-definition photojournalism image similar to news story: ${headline || 'Latest news journalism photo'}`;
      } else if (mode === 'modify') {
        finalPrompt = `Editorial news photo with ${activeModStyle} styling for: ${headline}`;
      } else if (!finalPrompt) {
        finalPrompt = headline || 'High-definition technology news image';
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
          category,
          aspectRatio,
          imageSize,
          style: activeModStyle,
          useSearchGrounding,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (data.success && data.imageUrl) {
        let finalImg = data.imageUrl;

        // Apply client canvas modifications if in modify mode
        if (mode === 'modify') {
          finalImg = await applyCanvasModifications(
            finalImg,
            activeModStyle,
            badgeText,
            headline,
            includeHeadlineOverlay
          );
        }

        setResultImageUrl(finalImg);
        setModelLabel(data.provider || providerName);
        setGenerationLog(data.message || `✨ Image created successfully in ${((data.timeTakenMs || 1000) / 1000).toFixed(1)}s`);
      } else {
        throw new Error(data.error || 'Could not synthesize image');
      }
    } catch (err: any) {
      console.warn('AI image generation error:', err);
      setErrorMsg(err?.message || 'Failed to generate image. Please check API settings.');
      // Fallback: apply canvas engine
      try {
        const baseSrc = referenceUrl || resultImageUrl || initialImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';
        const modified = await applyCanvasModifications(
          baseSrc,
          activeModStyle,
          badgeText,
          headline,
          includeHeadlineOverlay
        );
        setResultImageUrl(modified);
        setModelLabel(providerName);
      } catch {
        setErrorMsg('Failed to generate image. Please verify your prompt or API settings.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (resultImageUrl) {
      onApplyImage(resultImageUrl);
      setAppliedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    }
  };

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const a = document.createElement('a');
    a.href = resultImageUrl;
    a.download = `gadget-glow-${aiProvider}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">AI Image Studio Agent</h3>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gadget Glow CMS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Generate similar images, modify styles, or create attractive visuals with OpenAI ChatGPT & DALL-E 3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configure API Keys & Models"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">AI Keys & Models</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
          {/* AI Model Banner */}
          <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Active AI Engine:
              </span>
              <div className="inline-flex items-center gap-1.5 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>OpenAI ChatGPT (DALL-E 3)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>Model:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                dall-e-3
              </span>
            </div>
          </div>

          {/* Mode Selector Tabs (3 Modules) */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMode('similar')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'similar'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4 text-purple-500" />
              <span>1. Similar Image</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('modify')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'modify'
                  ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-red-500" />
              <span>2. Modify & Style Changes</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'generate'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>3. New Prompt Image</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* LEFT: Controls & Input for Selected Module */}
            <div className="md:col-span-6 space-y-4">
              {/* Context News Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  News Story Headline (संदर्भ शीर्षक):
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Enter news headline..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* MODULE 1: SIMILAR IMAGE MODULE */}
              {mode === 'similar' && (
                <div className="space-y-3 p-4 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                    <Wand2 className="w-4 h-4 text-purple-600" />
                    <span>Similar Image Module (URL आधारित समान चित्र):</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    AI analyzes your news headline and reference visual to generate a copyright-free, fresh variation matching the same beat.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Reference Image URL:
                    </label>
                    <input
                      type="url"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* MODULE 2: MODIFY / STYLE CHANGES MODULE */}
              {mode === 'modify' && (
                <div className="space-y-3.5 p-4 bg-red-500/5 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-600" />
                      <span>Modify & Style Changes Module</span>
                    </span>
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Live Canvas
                    </span>
                  </div>

                  {/* Style Choices */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Select Journalistic Style / Overlay:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'breaking_ribbon', label: '🚨 Breaking Ribbon', desc: 'Red bottom breaking ticker with text' },
                        { id: 'tech_glow', label: '⚡ Tech Neon Glow', desc: 'Cyan futuristic gradient & border' },
                        { id: 'cinematic', label: '🎬 Cinematic Bars', desc: 'Letterbox dark bars & warm lighting' },
                        { id: 'exclusive_badge', label: '⭐ Exclusive Scoop', desc: 'Golden special investigation stamp' },
                        { id: 'trending_hot', label: '🔥 Trending Hot', desc: 'Fiery ticker & highlight band' },
                        { id: 'monochrome_news', label: '📷 Classic B&W', desc: 'High-contrast newspaper print' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const newStyle = s.id as ModificationStyle;
                            setActiveModStyle(newStyle);
                            updateLiveCanvasPreview(newStyle, badgeText, headline, includeHeadlineOverlay);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            activeModStyle === s.id
                              ? 'border-red-600 bg-red-50 dark:bg-red-950/50 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs">{s.label}</div>
                          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Ribbon Text */}
                  {(activeModStyle === 'breaking_ribbon' || activeModStyle === 'trending_hot') && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Ticker Ribbon Text:
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => {
                          const newText = e.target.value;
                          setBadgeText(newText);
                          updateLiveCanvasPreview(activeModStyle, newText, headline, includeHeadlineOverlay);
                        }}
                        placeholder="ब्रेकिंग न्यूज़ | GADGET GLOW EXCLUSIVE"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={includeHeadlineOverlay}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIncludeHeadlineOverlay(checked);
                            updateLiveCanvasPreview(activeModStyle, badgeText, headline, checked);
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
                <div className="space-y-3 p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>New Prompt Image Module (विस्तृत AI प्रॉम्ट से बनाएं):</span>
                  </div>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="वर्णन करें कि आपको किस प्रकार का चित्र चाहिए (उदा. Latest flagship smartphone with transparent display on neon blue desk...)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />

                  {/* Preset Pills for Instant Inspiration */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Quick Trending Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {TOPIC_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomPrompt(p.prompt)}
                          className="text-[10px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Aspect Ratio (आकार अनुपात):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '16:9', label: '16:9 (Landscape)', desc: 'Standard News Article' },
                    { id: '4:3', label: '4:3 (Photo)', desc: 'Grid Thumbnails' },
                    { id: '1:1', label: '1:1 (Square)', desc: 'Social & Feed' },
                  ].map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id as AspectRatioType)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        aspectRatio === ar.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{ar.label}</div>
                      <div className="text-[10px] text-slate-400">{ar.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Generation Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ChatGPT (DALL-E 3) बना रहा है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      {mode === 'similar'
                        ? 'Generate Similar Image with ChatGPT'
                        : mode === 'modify'
                        ? 'Apply Modifications & Style Enhance'
                        : 'Generate Image with ChatGPT (DALL-E 3)'}
                    </span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {generationLog && !errorMsg && (
                <div className="p-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{generationLog}</span>
                </div>
              )}
            </div>

            {/* RIGHT: Live Visual Preview & Actions */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Image Preview ({modelLabel}):</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {aspectRatio === '16:9' ? '1280x720' : aspectRatio === '4:3' ? '1024x768' : '900x900'}
                </span>
              </div>

              {/* Preview Container */}
              <div
                className={`w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-200 dark:border-slate-800 relative group flex items-center justify-center ${
                  aspectRatio === '16:9' ? 'aspect-16/9' : aspectRatio === '4:3' ? 'aspect-4/3' : 'aspect-square'
                }`}
              >
                {resultImageUrl ? (
                  <img
                    src={resultImageUrl}
                    alt="AI Generated News"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-500 space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">चित्र जनरेट करने के लिए बाईं ओर बटन पर क्लिक करें</p>
                  </div>
                )}

                {/* Overlaid Model Watermark */}
                {resultImageUrl && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-md">
                    {modelLabel}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {resultImageUrl && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {appliedSuccess
                        ? '✅ खबर में सफलतापूर्वक जोड़ दिया गया!'
                        : 'इस चित्र को समाचार में लागू करें (Apply to Article)'}
                    </span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download High-Res</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>🔄 Regenerate Variation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Keys & Models Settings Modal */}
      <AiModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={(prov) => setAiProvider(prov)}
      />
    </div>
  );
};
