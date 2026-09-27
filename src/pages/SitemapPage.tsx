import React, { useState, useEffect } from 'react';
import { Article, Category, Subcategory } from '../types';
import { generateXmlSitemap } from '../utils/seo';
import { dbService } from '../services/db';
import { FileCode, Globe, Copy, Check, Download, ChevronRight, ExternalLink } from 'lucide-react';

export interface SitemapPageProps {
  articles?: Article[];
  categories?: Category[];
  subcategories?: Subcategory[];
  onNavigate?: (path: string) => void;
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onSelectCategory?: (slug: string) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({
  articles: initialArticles,
  categories: initialCategories,
  subcategories: initialSubcategories,
  onNavigate,
  onArticleClick,
  onSelectArticle,
  onSelectCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'xml'>('html');
  const [copied, setCopied] = useState(false);
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories || []);

  useEffect(() => {
    if (!initialArticles || initialArticles.length === 0) {
      dbService.getArticles({ status: 'published' }).then((data) => setArticles(data || []));
    } else {
      setArticles(initialArticles);
    }

    if (!initialCategories || initialCategories.length === 0) {
      dbService.getCategories().then((data) => setCategories(data || []));
    } else {
      setCategories(initialCategories);
    }

    if (!initialSubcategories || initialSubcategories.length === 0) {
      dbService.getSubcategories().then((data) => setSubcategories(data || []));
    } else {
      setSubcategories(initialSubcategories);
    }
  }, [initialArticles, initialCategories, initialSubcategories]);

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
    else if (onNavigate) onNavigate(`/news/${slug}`);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
    else if (path.startsWith('/category/') && onSelectCategory) onSelectCategory(path.replace('/category/', ''));
    else if (path.startsWith('/news/') && onSelectArticle) onSelectArticle(path.replace('/news/', ''));
  };

  const xmlContent = generateXmlSitemap(articles || [], categories || [], window.location.origin);

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeCategories = categories || [];
  const safeSubcategories = subcategories || [];
  const safeArticles = articles || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <button onClick={() => handleNavigate('/')} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">साइटमैप (Sitemap Directory)</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-red-500" />
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
              गैजेट ग्लो साइटमैप (Sitemap)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Google Bots, सर्च इंजनों और पाठकों के लिए संपूर्ण वेबसाइट लिंक डायरेक्टरी
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
              activeTab === 'html' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            HTML साइटमैप
          </button>
          <button
            onClick={() => setActiveTab('xml')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'xml' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            XML साइटमैप (For Google Bots)
          </button>
        </div>
      </div>

      {activeTab === 'html' ? (
        <div className="space-y-8">
          {/* Main Pages */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-neutral-100">
              मुख्य पृष्ठ (Main Navigation)
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              <li>
                <button onClick={() => handleNavigate('/')} className="text-slate-700 hover:text-red-600 font-medium">
                  • मुख्य पृष्ठ (Homepage)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/latest-news')} className="text-slate-700 hover:text-red-600 font-medium">
                  • ताजा खबरें (Latest News)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/breaking-news')} className="text-slate-700 hover:text-red-600 font-medium">
                  • बड़ी खबरें (Breaking News)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/videos')} className="text-slate-700 hover:text-red-600 font-medium">
                  • वीडियो बुलेटिन (Videos)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/photos')} className="text-slate-700 hover:text-red-600 font-medium">
                  • फोटो गैलरी (Photos)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/e-paper')} className="text-slate-700 hover:text-red-600 font-medium">
                  • दैनिक ई-पेपर (E-Paper)
                </button>
              </li>
            </ul>
          </div>

          {/* Categories & Subcategories */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-neutral-100">
              समाचार श्रेणियां एवं जिले (Categories & Districts)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
              {safeCategories.map((cat) => {
                const subs = safeSubcategories.filter((s) => s.parentCategoryId === cat.id);
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <button
                      onClick={() => handleNavigate(`/category/${cat.slug}`)}
                      className="font-bold text-slate-900 hover:text-red-600 text-sm block"
                    >
                      {cat.nameHi} ({cat.name})
                    </button>
                    {subs.length > 0 && (
                      <ul className="pl-3 space-y-1 text-slate-500 border-l border-neutral-200">
                        {subs.map((s) => (
                          <li key={s.id}>
                            <button
                              onClick={() => handleNavigate(`/category/${cat.slug}`)}
                              className="hover:text-red-600"
                            >
                              - {s.nameHi} ({s.name})
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Articles Directory */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-neutral-100">
              प्रकाशित समाचार सूची ({safeArticles.length})
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {safeArticles.map((art) => (
                <li key={art.id}>
                  <button
                    onClick={() => handleArticleClick(art.slug)}
                    className="text-left text-slate-700 hover:text-red-600 line-clamp-1"
                  >
                    • <span className="font-semibold text-red-700">[{art.categoryName}]</span> {art.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Static Pages */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-neutral-100">
              विधिक एवं कंपनी सूचना (Legal & Company)
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <li>
                <button onClick={() => handleNavigate('/about')} className="text-slate-700 hover:text-red-600">
                  • हमारे बारे में (About Us)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/contact')} className="text-slate-700 hover:text-red-600">
                  • संपर्क करें (Contact Us)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/privacy-policy')} className="text-slate-700 hover:text-red-600">
                  • गोपनीयता नीति (Privacy Policy)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/terms')} className="text-slate-700 hover:text-red-600">
                  • नियम और शर्तें (Terms & Conditions)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('/disclaimer')} className="text-slate-700 hover:text-red-600">
                  • अस्वीकरण (Disclaimer)
                </button>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        /* XML SITEMAP TAB */
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="font-bold text-base text-slate-900">Google News & Standard XML Sitemap</h2>
              <p className="text-xs text-slate-500">
                यह XML साइटमैप Google Search Console, Bing Webmaster और सर्च इंजन क्रॉलरों के लिए तैयार किया गया है।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyXml}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 border border-neutral-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'कॉपी हुआ!' : 'कॉपी XML'}
              </button>
              <button
                onClick={handleDownloadXml}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                डाउनलोड sitemap.xml
              </button>
            </div>
          </div>

          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-[500px]">
            {xmlContent}
          </pre>
        </div>
      )}
    </div>
  );
};
