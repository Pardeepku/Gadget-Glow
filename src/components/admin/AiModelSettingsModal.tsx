import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface AiModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (provider: 'gemini' | 'chatgpt') => void;
}

export const AiModelSettingsModal: React.FC<AiModelSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState<'gemini' | 'chatgpt'>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-flash-image');
  const [openAiModel, setOpenAiModel] = useState('dall-e-3');

  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [geminiKeyMasked, setGeminiKeyMasked] = useState('');
  const [openAiKeyMasked, setOpenAiKeyMasked] = useState('');

  const [testStatus, setTestStatus] = useState<{
    provider: 'gemini' | 'chatgpt' | null;
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ provider: null, testing: false });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current config on open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/ai/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasGeminiKey(Boolean(data.hasGeminiKey));
          setHasOpenAiKey(Boolean(data.hasOpenAiKey));
          setGeminiKeyMasked(data.geminiKeyMasked || '');
          setOpenAiKeyMasked(data.openAiKeyMasked || '');
          if (data.defaultProvider) setDefaultProvider(data.defaultProvider);
          if (data.geminiModel) setGeminiModel(data.geminiModel);
          if (data.openAiModel) setOpenAiModel(data.openAiModel);
        }
      })
      .catch((err) => console.warn('Failed to load AI config:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async (provider: 'gemini' | 'chatgpt') => {
    setTestStatus({ provider, testing: true });
    try {
      const apiKeyToTest = provider === 'gemini' ? geminiApiKey : openAiApiKey;
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKeyToTest }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus({
          provider,
          testing: false,
          success: true,
          message: data.message || 'Key verified successfully!',
        });
      } else {
        setTestStatus({
          provider,
          testing: false,
          success: false,
          message: data.error || 'Key validation failed.',
        });
      }
    } catch (err: any) {
      setTestStatus({
        provider,
        testing: false,
        success: false,
        message: err?.message || 'Connection test failed',
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultProvider,
          geminiApiKey,
          openAiApiKey,
          geminiModel,
          openAiModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        setHasOpenAiKey(Boolean(data.hasOpenAiKey));
        if (data.geminiKeyMasked) setGeminiKeyMasked(data.geminiKeyMasked);
        if (data.openAiKeyMasked) setOpenAiKeyMasked(data.openAiKeyMasked);
        setGeminiApiKey('');
        setOpenAiApiKey('');
        if (onConfigUpdated) onConfigUpdated(defaultProvider);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Save AI config failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">AI Models & API Keys Settings</h3>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CMS Control
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Configure Google Gemini AI & ChatGPT (OpenAI) Image Generation Models
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Active Default Model Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Primary AI Image Generation Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDefaultProvider('gemini')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  defaultProvider === 'gemini'
                    ? 'border-purple-600 bg-purple-500/10 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-sm">Nano Banana 2 (Gemini AI)</span>
                  </div>
                  {hasGeminiKey ? (
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Key Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Nano Banana 2 (gemini-3.1-flash-image) for fast image generation &amp; editing with real-time Google Search Grounding.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDefaultProvider('chatgpt')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  defaultProvider === 'chatgpt'
                    ? 'border-emerald-600 bg-emerald-500/10 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-sm">ChatGPT (DALL-E 3)</span>
                  </div>
                  {hasOpenAiKey ? (
                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Key Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  OpenAI DALL-E 3 Model for photorealistic visuals, intricate artistic prompts and detail.
                </p>
              </button>
            </div>
          </div>

          {/* Section 1: Google Gemini API Configuration */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                  <Key className="w-4 h-4" />
                  <span>Google Gemini API Key</span>
                </span>
                {hasGeminiKey && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Loaded {geminiKeyMasked ? `(${geminiKeyMasked})` : ''}</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleTestKey('gemini')}
                disabled={testStatus.testing}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                {testStatus.testing && testStatus.provider === 'gemini' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Test Gemini Key</span>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder={hasGeminiKey ? 'Enter new key to replace existing' : 'AIzaSy...'}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Model: gemini-3.1-flash-lite-image / gemini-3.1-flash-image</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  <span>Get Gemini API Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="p-2.5 bg-purple-100/60 dark:bg-purple-950/40 rounded-xl text-[10px] text-purple-900 dark:text-purple-300 leading-snug">
                <strong>Google AI Studio Free-Tier Notice:</strong> Google sets limit: 0 on direct image generation for free-tier keys (requires enabling Pay-As-You-Go billing in Google AI Studio). On free-tier keys, the app auto-switches to ChatGPT or our Smart Editorial Engine.
              </div>
            </div>
          </div>

          {/* Section 2: ChatGPT (OpenAI) API Configuration */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Key className="w-4 h-4" />
                  <span>ChatGPT / OpenAI API Key</span>
                </span>
                {hasOpenAiKey && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Loaded {openAiKeyMasked ? `(${openAiKeyMasked})` : ''}</span>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleTestKey('chatgpt')}
                disabled={testStatus.testing}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                {testStatus.testing && testStatus.provider === 'chatgpt' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <span>Test OpenAI Key</span>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="password"
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
                placeholder={hasOpenAiKey ? 'Enter new key to replace existing' : 'sk-proj-...'}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Model: dall-e-3 (Photorealistic, HD)</span>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Get OpenAI API Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="p-2.5 bg-emerald-100/60 dark:bg-emerald-950/40 rounded-xl text-[10px] text-emerald-900 dark:text-emerald-300 leading-snug">
                <strong>Recommended for AI Images:</strong> OpenAI DALL-E 3 works seamlessly with active accounts. Generates high-definition journalistic news visuals in 16:9, 4:3, and 1:1.
              </div>
            </div>
          </div>

          {/* Test Status feedback */}
          {testStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                testStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>AI Model configuration saved successfully!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">
              Keys are securely stored on the server proxy and never exposed to website visitors.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Settings...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
