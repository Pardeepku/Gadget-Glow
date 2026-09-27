import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, Language } from '../../contexts/LanguageContext';
import { Globe, Check, ChevronDown, Search, Sparkles } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'header';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'compact' }) => {
  const { currentLanguage, changeLanguage, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectLanguage = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-700 transition-all shadow-xs"
        aria-expanded={isOpen}
        title="वेबसाइट भाषा बदलें / Change Language"
        id="top-language-selector-btn"
      >
        <Globe className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
        <span className="font-medium text-white">{currentLanguage.nativeName}</span>
        <span className="text-[10px] text-slate-400 uppercase font-mono">({currentLanguage.code})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Selection Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Globe className="w-3.5 h-3.5" />
              <span>भाषा चुनें (Select Language)</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              18+ भाषाएं
            </span>
          </div>

          {/* Search Input */}
          <div className="p-2 border-b border-slate-800 bg-slate-900">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="भाषा खोजें (Hindi, Punjabi, English...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Language Options List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = currentLanguage.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{lang.flag}</span>
                      <div>
                        <span className="font-serif font-bold text-sm block text-white">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">कोई भाषा नहीं मिली</div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>पूरी वेबसाइट तुरंत चुनी गई भाषा में बदल जाएगी</span>
          </div>
        </div>
      )}
    </div>
  );
};
