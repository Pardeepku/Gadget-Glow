import React, { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { dbService } from '../services/db';
import { Search, Clock, Eye, Filter } from 'lucide-react';

export interface SearchPageProps {
  initialQuery?: string;
  categories?: Category[];
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onSelectCategory?: (slug: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  categories: initialCategories,
  onArticleClick,
  onSelectArticle,
  onNavigate,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      dbService.getCategories().then((cats) => setCategories(cats || []));
    } else {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
    else if (onNavigate) onNavigate(`/news/${slug}`);
  };

  const performSearch = async (q: string, cat: string) => {
    setLoading(true);
    const articles = await dbService.getArticles({
      searchQuery: q,
      categoryId: cat === 'all' ? undefined : cat,
      status: 'published',
    });
    setResults(articles || []);
    setLoading(false);
  };

  useEffect(() => {
    performSearch(query, selectedCategory);
  }, [query, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, selectedCategory);
  };

  const safeCategories = categories || [];
  const safeResults = results || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 shadow-sm">
        <h1 className="font-serif font-black text-2xl mb-4">समाचार खोजें (Search Portal)</h1>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="शीर्षक, विषय, जिला या कीवर्ड दर्ज करें..."
              className="w-full bg-slate-800 text-white pl-11 pr-4 py-3 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 text-white py-3 px-3 rounded-lg border border-slate-700 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="all">सभी श्रेणियां</option>
              {safeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameHi} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors cursor-pointer"
          >
            खोजें
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-neutral-200">
          <h2 className="text-sm font-bold text-slate-700">
            खोज परिणाम: <span className="text-red-600 font-bold">{safeResults.length}</span> समाचार मिले
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">खोज जारी है...</div>
        ) : safeResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeResults.map((art) => (
              <div
                key={art.id}
                onClick={() => handleArticleClick(art.slug)}
                className="group cursor-pointer bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectCategory) onSelectCategory(art.categoryId);
                      }}
                      className="text-[10px] font-bold text-red-600 uppercase mb-1 block hover:underline cursor-pointer"
                    >
                      {art.categoryName}
                    </button>
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{art.shortDescription}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-neutral-100">
                    <span>{art.authorName}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(art.publishedAt || art.createdAt || '').toLocaleDateString('hi-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center text-slate-500 text-sm">
            कोई समाचार नहीं मिला। कृपया अलग कीवर्ड डालकर पुनः प्रयास करें।
          </div>
        )}
      </div>
    </div>
  );
};
