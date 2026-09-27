import React, { useState, useEffect } from 'react';
import { Article, Category, Subcategory } from '../types';
import { dbService } from '../services/db';
import { updateMetaTags } from '../utils/seo';
import { AdBanner } from '../components/common/AdBanner';
import { Clock, Eye, MapPin, ChevronRight, Filter } from 'lucide-react';

export interface CategoryPageProps {
  categorySlug: string;
  subcategorySlug?: string;
  categories?: Category[];
  subcategories?: Subcategory[];
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onSelectCategory?: (slug: string) => void;
  onNavigate?: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  subcategorySlug,
  categories: initialCategories,
  subcategories: initialSubcategories,
  onArticleClick,
  onSelectArticle,
  onNavigate,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories || []);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedSub, setSelectedSub] = useState<string>(subcategorySlug || 'all');
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      dbService.getCategories().then((cats) => setCategories(cats || []));
    } else {
      setCategories(initialCategories);
    }

    if (!initialSubcategories || initialSubcategories.length === 0) {
      dbService.getSubcategories().then((subs) => setSubcategories(subs || []));
    } else {
      setSubcategories(initialSubcategories);
    }
  }, [initialCategories, initialSubcategories]);

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  const currentCategory = (categories || []).find(
    (c) => c.slug === categorySlug || c.id === categorySlug
  ) || {
    id: categorySlug || 'cat-desh',
    name: 'National',
    nameHi: 'समाचार श्रेणी',
    slug: categorySlug || 'news',
    order: 1,
    isActive: true,
  };

  const relevantSubcategories = (subcategories || []).filter(
    (s) => s.parentCategoryId === currentCategory.id || s.parentCategoryId === categorySlug
  );

  useEffect(() => {
    let mounted = true;
    dbService.getArticles({ categoryId: currentCategory.id, status: 'published' }).then((data) => {
      if (mounted) setArticles(data || []);
    });

    updateMetaTags({
      title: `${currentCategory.nameHi} समाचार - Gadget Glow`,
      description: `${currentCategory.nameHi} की ताजा और महत्वपूर्ण खबरें गैजेट ग्लो पर पढ़ें।`,
      keywords: [currentCategory.nameHi, currentCategory.name, 'Gadget Glow', 'गैजेट ग्लो'],
      url: `${window.location.origin}/category/${currentCategory.slug}`,
    });

    return () => {
      mounted = false;
    };
  }, [categorySlug, currentCategory.id]);

  let filtered = articles || [];
  if (selectedSub !== 'all') {
    filtered = filtered.filter((a) => a.subcategoryId === selectedSub || a.subcategoryName === selectedSub);
  }

  if (sortBy === 'views') {
    filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <a
          href="/"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              handleNavigate('/');
            }
          }}
          className="hover:text-red-600"
        >
          होम
        </a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">{currentCategory.nameHi}</span>
        {selectedSub !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600">{selectedSub}</span>
          </>
        )}
      </nav>

      {/* Category Title Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-5 bg-red-600 rounded-xs"></span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
                {currentCategory.nameHi} समाचार
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {currentCategory.description || `${currentCategory.nameHi} से जुड़ी पल-पल की ताजा खबरें और विशेष रिपोर्ट`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">क्रमबद्ध:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded border border-slate-700 focus:outline-none"
            >
              <option value="latest">ताजा खबरें (Latest)</option>
              <option value="views">सबसे लोकप्रिय (Most Read)</option>
            </select>
          </div>
        </div>

        {/* Subcategories pills if any */}
        {relevantSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800 no-scrollbar">
            <button
              onClick={() => setSelectedSub('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                selectedSub === 'all' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              सभी (All)
            </button>
            {relevantSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                  selectedSub === sub.id ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3 h-3" />
                {sub.nameHi} ({sub.name})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <a
              key={art.id}
              href={`/news/${encodeURIComponent(art.slug)}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  handleArticleClick(art.slug);
                }
              }}
              className="group cursor-pointer bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between block"
            >
              <div className="aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {art.subcategoryName && (
                    <span className="text-[10px] font-bold text-red-600 uppercase mb-1 block">
                      📍 {art.subcategoryName}
                    </span>
                  )}
                  <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{art.shortDescription}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-neutral-100">
                  <span>{art.authorName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(art.publishedAt || art.createdAt).toLocaleDateString('hi-IN')}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 text-sm mb-4">इस श्रेणी में अभी कोई समाचार उपलब्ध नहीं है।</p>
          <button onClick={() => handleNavigate('/')} className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded font-bold">
            होमपेज पर जाएं
          </button>
        </div>
      )}

      {/* Category Footer Ad */}
      <AdBanner position="homepage_middle" />
    </div>
  );
};
