import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Save,
  Check,
  Zap,
  Sliders,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ArrowRight,
  HelpCircle,
  Info,
} from 'lucide-react';

export const AiModelsSettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Configuration State
  const [defaultProvider, setDefaultProvider] = useState<'gemini' | 'chatgpt' | 'auto'>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-image');
  const [openAiModel, setOpenAiModel] = useState('dall-e-3');

  // Masked keys from server
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [geminiKeyMasked, setGeminiKeyMasked] = useState('');
  const [openAiKeyMasked, setOpenAiKeyMasked] = useState('');

  // Key Visibility toggles
  const [showGeminiInput, setShowGeminiInput] = useState(false);
  const [showOpenAiInput, setShowOpenAiInput] = useState(false);

  // Test Connection status
  const [testState, setTestState] = useState<{
    provider: 'gemini' | 'chatgpt' | null;
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ provider: null, testing: false });

  // Quick Test Generation
  const [testPrompt, setTestPrompt] = useState('Futuristic flagship smartphone with transparent glowing holographic screen on a dark high-tech desk');
  const [testGenerating, setTestGenerating] = useState(false);
  const [testResultImage, setTestResultImage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Fetch config on mount
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (data.success) {
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        setHasOpenAiKey(Boolean(data.hasOpenAiKey));
        setGeminiKeyMasked(data.geminiKeyMasked || '');
        setOpenAiKeyMasked(data.openAiKeyMasked || '');
        if (data.defaultProvider) setDefaultProvider(data.defaultProvider);
        if (data.geminiModel) setGeminiModel(data.geminiModel);
        if (data.openAiModel) setOpenAiModel(data.openAiModel);
      }
    } catch (err) {
      console.warn('Failed to load AI config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestKey = async (provider: 'gemini' | 'chatgpt') => {
    setTestState({ provider, testing: true });
    try {
      const apiKeyToTest = provider === 'gemini' ? geminiApiKey : openAiApiKey;
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKeyToTest }),
      });
      const data = await res.json();
      if (data.success) {
        setTestState({
          provider,
          testing: false,
          success: true,
          message: data.message || `${provider === 'gemini' ? 'Google Gemini' : 'ChatGPT (OpenAI)'} API key verified and working!`,
        });
      } else {
        setTestState({
          provider,
          testing: false,
          success: false,
          message: data.error || 'Connection failed. Please check the API key.',
        });
      }
    } catch (err: any) {
      setTestState({
        provider,
        testing: false,
        success: false,
        message: err?.message || 'Connection test failed',
      });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload: any = {
        defaultProvider,
        geminiModel,
        openAiModel,
      };
      if (geminiApiKey.trim()) {
        payload.geminiApiKey = geminiApiKey.trim();
      }
      if (openAiApiKey.trim()) {
        payload.openAiApiKey = openAiApiKey.trim();
      }

      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        setHasOpenAiKey(Boolean(data.hasOpenAiKey));
        if (data.geminiKeyMasked) setGeminiKeyMasked(data.geminiKeyMasked);
        if (data.openAiKeyMasked) setOpenAiKeyMasked(data.openAiKeyMasked);
        setGeminiApiKey('');
        setOpenAiApiKey('');
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.warn('Save AI configuration failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickTestGenerate = async (providerToUse: 'gemini' | 'chatgpt') => {
    setTestGenerating(true);
    setTestError(null);
    setTestResultImage(null);

    try {
      const res = await fetch('/api/ai/image-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerToUse,
          mode: 'generate',
          prompt: testPrompt,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setTestResultImage(data.imageUrl);
      } else {
        setTestError(data.error || 'Could not generate test image. Please verify your API Key.');
      }
    } catch (err: any) {
      setTestError(err?.message || 'Generation test request failed.');
    } finally {
      setTestGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                CMS AI Control Panel
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                Dual AI Models Supported
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>Google Gemini & ChatGPT AI Models</span>
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              गैजेट ग्लो CMS के लिए Google Gemini और ChatGPT (OpenAI DALL-E) इमेज जेनरेशन मॉडल्स व API Keys को कॉन्फ़िगर और टेस्ट करें। आप दोनों में से किसी भी मॉडल को प्राथमिकता दे सकते हैं।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save AI Settings</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">AI Models configuration and API Keys saved successfully to disk!</span>
        </div>
      )}

      {/* 2. Default Active Provider Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Default Active Image Generation Engine (मुख्य डिफ़ॉल्ट AI मॉडल)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            वेबसाइट और AI इमेज स्टूडियो में इमेज जेनरेशन, सिमिलर इमेज और स्टाइल मॉडिफिकेशन के लिए प्राथमिक मॉडल चुनें
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Google Gemini */}
          <div
            onClick={() => setDefaultProvider('gemini')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              defaultProvider === 'gemini'
                ? 'border-purple-600 bg-purple-500/5 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Google Gemini AI</h3>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">gemini-3.1-flash-image</div>
                </div>
              </div>
              {defaultProvider === 'gemini' && (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-snug">
              Google का नवीनतम AI मॉडल जो फ़ोटो और न्यूज़ विज़ुअल्स को तेज़ी से जनरेट व मॉडिफाई करता है।
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Key Status:</span>
              <span className={`font-semibold ${hasGeminiKey ? 'text-emerald-600' : 'text-amber-500'}`}>
                {hasGeminiKey ? '🟢 Active & Ready' : '⚠️ Key Required'}
              </span>
            </div>
          </div>

          {/* Card 2: ChatGPT DALL-E */}
          <div
            onClick={() => setDefaultProvider('chatgpt')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              defaultProvider === 'chatgpt'
                ? 'border-emerald-600 bg-emerald-500/5 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">ChatGPT (OpenAI DALL-E)</h3>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">dall-e-3</div>
                </div>
              </div>
              {defaultProvider === 'chatgpt' && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-snug">
              OpenAI का DALL-E 3 मॉडल जो अत्यधिक विस्तृत, फ़ोटोरियलिस्टिक और रचनात्मक विज़ुअल्स बनाता है।
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Key Status:</span>
              <span className={`font-semibold ${hasOpenAiKey ? 'text-emerald-600' : 'text-amber-500'}`}>
                {hasOpenAiKey ? '🟢 Active & Ready' : '⚠️ Key Required'}
              </span>
            </div>
          </div>

          {/* Card 3: Auto Smart Mode */}
          <div
            onClick={() => setDefaultProvider('auto')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
              defaultProvider === 'auto'
                ? 'border-indigo-600 bg-indigo-500/5 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Auto Smart Fallback</h3>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">Gemini ⇄ ChatGPT</div>
                </div>
              </div>
              {defaultProvider === 'auto' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-snug">
              दोनों में से उपलब्ध मॉडल को स्वतः चुनेगा और नेटवर्क या कोटा समस्या होने पर तुरंत बैकअप इंजन चलाएगा।
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Reliability:</span>
              <span className="font-semibold text-indigo-600">⚡ 100% High Availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. API Keys & Models Configuration Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MODEL 1: GOOGLE GEMINI CONFIGURATION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Google Gemini AI</h3>
                <p className="text-[11px] text-slate-500">Google GenAI TypeScript SDK v0.1+</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                hasGeminiKey
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}
            >
              {hasGeminiKey ? '● API Key Connected' : '○ Not Configured'}
            </span>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Google Gemini Image Model</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Nano Banana Series</span>
            </label>
            <select
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Nano Banana 2 - Fast Image Gen &amp; Editing + Google Search Grounding)</option>
              <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Nano Banana Lite - High Speed)</option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default Recommended: <code className="text-purple-600 font-bold">gemini-3.1-flash-image (Nano Banana 2)</code>
            </span>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span>Google Gemini API Key</span>
              </label>
              {hasGeminiKey && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Saved: {geminiKeyMasked}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showGeminiInput ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder={hasGeminiKey ? 'Enter new key to update...' : 'AIzaSy... (Paste Gemini API Key here)'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowGeminiInput(!showGeminiInput)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showGeminiInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Key will be securely stored on backend only</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get Gemini Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-[11px] text-purple-900 dark:text-purple-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                <span>Google AI Studio Free-Tier Notice:</span>
              </div>
              <p className="leading-relaxed">
                Google assigns <span className="font-semibold text-rose-600 dark:text-rose-400">limit: 0 requests</span> to direct image models (<code className="text-purple-700 dark:text-purple-300 font-mono">gemini-3.1-flash-image</code>) on Free-Tier accounts (requires enabling Pay-As-You-Go billing in Google AI Studio). On free-tier keys, the app seamlessly falls back to ChatGPT (OpenAI) or our Smart Thematic Editorial Engine so you are never blocked.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleTestKey('gemini')}
              disabled={testState.testing}
              className="flex-1 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {testState.testing && testState.provider === 'gemini' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Test Gemini Key</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickTestGenerate('gemini')}
              disabled={testGenerating}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/20 transition-colors cursor-pointer disabled:opacity-60"
            >
              {testGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate Test Image</span>
            </button>
          </div>

          {/* Test Status Msg */}
          {testState.provider === 'gemini' && testState.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                testState.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testState.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testState.message}</span>
            </div>
          )}
        </div>

        {/* MODEL 2: CHATGPT (OPENAI DALL-E) CONFIGURATION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">ChatGPT (OpenAI DALL-E)</h3>
                <p className="text-[11px] text-slate-500">OpenAI API Images v1</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                hasOpenAiKey
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}
            >
              {hasOpenAiKey ? '● API Key Connected' : '○ Not Configured'}
            </span>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              OpenAI Image Model Version
            </label>
            <select
              value={openAiModel}
              onChange={(e) => setOpenAiModel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="dall-e-3">dall-e-3 (Photorealistic, Highest Detail, HD)</option>
              <option value="dall-e-2">dall-e-2 (Standard Generation & Fast)</option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Default Recommended: <code className="text-emerald-600">dall-e-3</code>
            </span>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>OpenAI / ChatGPT API Key</span>
              </label>
              {hasOpenAiKey && (
                <span className="text-[11px] text-slate-500 font-mono">
                  Saved: {openAiKeyMasked}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showOpenAiInput ? 'text' : 'password'}
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                placeholder={hasOpenAiKey ? 'Enter new key to update...' : 'sk-proj-... (Paste OpenAI API Key here)'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowOpenAiInput(!showOpenAiInput)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showOpenAiInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Key will be securely stored on backend only</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Get OpenAI Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ChatGPT (DALL-E 3) Recommended for Image Generation:</span>
              </div>
              <p className="leading-relaxed">
                OpenAI DALL-E 3 works reliably with standard OpenAI API accounts that have credit balance. All resolution parameters have been tuned for high-resolution 16:9, 4:3, and 1:1 journalistic news graphics.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleTestKey('chatgpt')}
              disabled={testState.testing}
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {testState.testing && testState.provider === 'chatgpt' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Test ChatGPT Key</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickTestGenerate('chatgpt')}
              disabled={testGenerating}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/20 transition-colors cursor-pointer disabled:opacity-60"
            >
              {testGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              <span>Generate Test Image</span>
            </button>
          </div>

          {/* Test Status Msg */}
          {testState.provider === 'chatgpt' && testState.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                testState.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testState.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testState.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Test Output Gallery */}
      {(testResultImage || testError || testGenerating) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span>Model Test Generation Output</span>
            </h3>
            {testResultImage && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Generated Successfully
              </span>
            )}
          </div>

          {testGenerating && (
            <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Calling AI Model to generate test image... (Please allow 5-15 seconds)
              </p>
            </div>
          )}

          {testError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Test Error: </span>
                <span>{testError}</span>
              </div>
            </div>
          )}

          {testResultImage && (
            <div className="space-y-3">
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-w-xl mx-auto shadow-xl">
                <img
                  src={testResultImage}
                  alt="AI Model Test Result"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-xs text-slate-500">
                Prompt tested: &quot;{testPrompt}&quot;
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Save Button Footer */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Enterprise Safe Storage
            </h4>
            <p className="text-xs text-slate-500">
              All keys are stored securely on the Node.js backend environment and never exposed to website visitors.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 cursor-pointer disabled:opacity-60"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Changes</span>
        </button>
      </div>
    </div>
  );
};
