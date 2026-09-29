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
  Check,
} from 'lucide-react';

interface AiModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: (provider: 'chatgpt') => void;
}

export const AiModelSettingsModal: React.FC<AiModelSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [openAiChatModel, setOpenAiChatModel] = useState('gpt-4o-mini');
  const [openAiModel, setOpenAiModel] = useState('dall-e-3');

  const [hasOpenAiKey, setHasOpenAiKey] = useState(false);
  const [openAiKeyMasked, setOpenAiKeyMasked] = useState('');

  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current config on open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/ai/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasOpenAiKey(Boolean(data.hasOpenAiKey));
          setOpenAiKeyMasked(data.openAiKeyMasked || '');
          if (data.openAiChatModel) setOpenAiChatModel(data.openAiChatModel);
          if (data.openAiModel) setOpenAiModel(data.openAiModel);
        }
      })
      .catch((err) => console.warn('Failed to load AI config in modal:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleTestKey = async () => {
    setTestStatus({ testing: true });
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
        setTestStatus({
          testing: false,
          success: true,
          message: data.message || 'OpenAI API key connected successfully!',
        });
      } else {
        setTestStatus({
          testing: false,
          success: false,
          message: data.error || 'Failed to authenticate with OpenAI',
        });
      }
    } catch (err: any) {
      setTestStatus({
        testing: false,
        success: false,
        message: err?.message || 'Network test failed',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
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
        setSaveSuccess(true);
        if (onConfigUpdated) onConfigUpdated('chatgpt');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save AI configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>OpenAI ChatGPT & DALL-E Settings</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Official OpenAI Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure OpenAI API Key for real-time Hindi news rewrite & image generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs">Loading AI settings...</p>
            </div>
          ) : (
            <>
              {/* OpenAI Status Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-300">OpenAI ChatGPT Model Active</h3>
                    <p className="text-[11px] text-slate-400">
                      Powers high-speed Hindi news rewriting and DALL-E 3 image generation
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                  {hasOpenAiKey ? 'Key Configured' : 'Needs Key'}
                </span>
              </div>

              {/* OpenAI API Key Input */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span>OpenAI API Key (sk-...)</span>
                  </label>
                  {hasOpenAiKey && (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved {openAiKeyMasked ? `(${openAiKeyMasked})` : ''}</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openAiApiKey}
                    onChange={(e) => setOpenAiApiKey(e.target.value)}
                    placeholder={hasOpenAiKey ? 'Enter new key to replace existing' : 'sk-...'}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testStatus.testing}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {testStatus.testing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Test Key</span>
                  </button>
                </div>

                {/* Test Feedback */}
                {testStatus.message && (
                  <div
                    className={`text-[11px] p-2 rounded-lg flex items-center gap-2 ${
                      testStatus.success
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {testStatus.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Used securely server-side for chat rewriting & image synthesis.</span>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Get OpenAI Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Model Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* News Rewriter Model */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Article Rewriter Model
                  </label>
                  <select
                    value={openAiChatModel}
                    onChange={(e) => setOpenAiChatModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                    <option value="gpt-4o">gpt-4o (Flagship Editorial)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    High-speed Hindi news rewriting & headline generation.
                  </p>
                </div>

                {/* Image Generation Model */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-200 block">
                    Image Generation Model
                  </label>
                  <select
                    value={openAiModel}
                    onChange={(e) => setOpenAiModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="dall-e-3">DALL-E 3 (High Definition 16:9)</option>
                    <option value="dall-e-2">DALL-E 2 (Standard)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">
                    Journalistic photo generation for news articles.
                  </p>
                </div>
              </div>

              {/* Billing Notice & Help */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>💡 OpenAI Account Credits Note</span>
                  <a
                    href="https://platform.openai.com/settings/organization/billing"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Check Billing</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] leading-relaxed">
                  OpenAI API requires credit balance on your account. If your credit balance is 0, the built-in Smart Editorial Engine will synthesize news reports and graphics smoothly without interruptions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Configuration saved successfully!</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AiModelSettingsModal;
