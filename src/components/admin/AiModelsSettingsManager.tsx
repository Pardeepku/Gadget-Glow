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
  Info,
} from 'lucide-react';

export const AiModelsSettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Configuration State
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [openAiChatModel, setOpenAiChatModel] = useState('gpt-4o-mini');
  const [openAiModel, setOpenAiModel] = useState('dall-e-3');

  // Masked keys from server
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [openAiKeyMasked, setOpenAiKeyMasked] = useState('');

  // Key Visibility toggle
  const [showOpenAiInput, setShowOpenAiInput] = useState(false);

  // Test Connection status
  const [testState, setTestState] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  // Quick Test Generation
  const [testPrompt, setTestPrompt] = useState('High-tech futuristic electric vehicle charging station with digital solar canopy in Haryana');
  const [testGenerating, setTestGenerating] = useState(false);
  const [testResultImage, setTestResultImage] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  // Fetch config on mount
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      if (data.success) {
        setHasOpenAiKey(Boolean(data.hasOpenAiKey));
        setOpenAiKeyMasked(data.openAiKeyMasked || '');
        if (data.openAiChatModel) setOpenAiChatModel(data.openAiChatModel);
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

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/ai/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openAiApiKey: openAiApiKey.trim() || undefined,
          openAiChatModel,
          openAiModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasOpenAiKey(Boolean(data.hasOpenAiKey));
        if (data.openAiKeyMasked) setOpenAiKeyMasked(data.openAiKeyMasked);
        setOpenAiApiKey('');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save AI configuration failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestKey = async () => {
    setTestState({ testing: true });
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: openAiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestState({
          testing: false,
          success: true,
          message: data.message || 'OpenAI API key verified and connected successfully!',
        });
      } else {
        setTestState({
          testing: false,
          success: false,
          message: data.error || 'Authentication with OpenAI failed',
        });
      }
    } catch (err: any) {
      setTestState({
        testing: false,
        success: false,
        message: err?.message || 'Connection test failed',
      });
    }
  };

  const handleRunQuickTestImage = async () => {
    if (!testPrompt.trim()) return;
    setTestGenerating(true);
    setTestError(null);
    setTestNotice(null);
    try {
      const res = await fetch('/api/ai/image-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt.trim(),
          aspectRatio: '16:9',
          mode: 'generate',
          apiKey: openAiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setTestResultImage(data.imageUrl);
        if (data.notice === 'openai_credits_exhausted') {
          setTestNotice('OpenAI account has 0 credit balance. Image synthesized using the high-definition Smart Editorial Engine.');
        }
      } else {
        setTestError(data.error || 'Failed to generate test image');
      }
    } catch (err: any) {
      setTestError(err?.message || 'Image generation network error');
    } finally {
      setTestGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>OpenAI ChatGPT & DALL-E Model Studio</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                Active AI Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Powering real-time Hindi news rewriting, editorial highlights, and DALL-E 3 image generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchConfig}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
            title="Refresh AI Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>OpenAI model settings successfully saved and applied to your news portal!</span>
        </div>
      )}

      {/* Main Grid: API Key & Model Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Key Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* OpenAI API Key Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-white shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">OpenAI API Key</h2>
                  <p className="text-[11px] text-slate-400">Required for ChatGPT articles and DALL-E 3 visuals</p>
                </div>
              </div>

              {hasOpenAiKey ? (
                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured {openAiKeyMasked ? `(${openAiKeyMasked})` : ''}</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Key Required</span>
                </span>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Enter OpenAI API Secret Key:
              </label>
              <div className="relative">
                <input
                  type={showOpenAiInput ? 'text' : 'password'}
                  value={openAiApiKey}
                  onChange={(e) => setOpenAiApiKey(e.target.value)}
                  placeholder={hasOpenAiKey ? 'Key is loaded. Enter new key to replace.' : 'sk-svcacct-... or sk-...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAiInput(!showOpenAiInput)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  {showOpenAiInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testState.testing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {testState.testing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>Test OpenAI Connection</span>
                </button>

                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Get OpenAI API Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {testState.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    testState.success
                      ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                  }`}
                >
                  {testState.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{testState.message}</span>
                </div>
              )}
            </div>

            {/* Model Selectors */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Active OpenAI Models</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    News Rewriter (Chat)
                  </label>
                  <select
                    value={openAiChatModel}
                    onChange={(e) => setOpenAiChatModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                    <option value="gpt-4o">gpt-4o (Flagship Intelligence)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Generates fluent Hindi news copy with structured highlight boxes.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    News Image Model (DALL-E)
                  </label>
                  <select
                    value={openAiModel}
                    onChange={(e) => setOpenAiModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="dall-e-3">dall-e-3 (1792x1024 / 1024x1024 4K)</option>
                    <option value="dall-e-2">dall-e-2 (1024x1024 Standard)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Synthesizes photojournalistic visuals for articles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Billing Advisory */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-200 font-bold">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>OpenAI Billing & Credits Guide</span>
              </span>
              <a
                href="https://platform.openai.com/settings/organization/billing"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Add OpenAI Credits</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              OpenAI requires credit balance on your account. If your account shows &quot;insufficient_quota&quot; or 0 credits remaining, you can add credits ($5 minimum) at the OpenAI Billing dashboard. In the meantime, the portal&apos;s Smart Editorial Engine seamlessly crafts high-impact Hindi news reports and graphics without stopping your workflow.
            </p>
          </div>
        </div>

        {/* Right Column: Live Test Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white shadow-lg">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Generation Test</h3>
                <p className="text-[11px] text-slate-400">Test image generation with your OpenAI configuration</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                News Topic / Visual Prompt:
              </label>
              <textarea
                rows={3}
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleRunQuickTestImage}
              disabled={testGenerating || !testPrompt.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/30 disabled:opacity-50"
            >
              {testGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ChatGPT Generating Image...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Generate Test Image</span>
                </>
              )}
            </button>

            {testNotice && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-[11px] leading-relaxed">
                {testNotice}
              </div>
            )}

            {testError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{testError}</span>
              </div>
            )}

            {/* Generated Image Result Preview */}
            {testResultImage && (
              <div className="space-y-2 pt-2 border-t border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Visual Generated</span>
                  </span>
                  <a
                    href={testResultImage}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Full View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                  <img
                    src={testResultImage}
                    alt="Generated Test"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AiModelsSettingsManager;
