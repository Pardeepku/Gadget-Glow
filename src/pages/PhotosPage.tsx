import React, { useState, useEffect } from 'react';
import { Camera, Eye, X, ChevronRight } from 'lucide-react';
import { Article } from '../types';
import { dbService } from '../services/db';

export interface PhotosPageProps {
  articles?: Article[];
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onNavigate?: (path: string) => void;
}

export const PhotosPage: React.FC<PhotosPageProps> = ({
  articles: initialArticles,
  onArticleClick,
  onSelectArticle,
  onNavigate,
}) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!initialArticles || initialArticles.length === 0) {
      dbService.getArticles({ status: 'published' }).then((data) => setArticles(data || []));
    } else {
      setArticles(initialArticles);
    }
  }, [initialArticles]);

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  const safeArticles = articles || [];
  const photoArticles = safeArticles.filter((a) => a.gallery && a.gallery.length > 0);
  const displayArticles = photoArticles.length > 0 ? photoArticles : safeArticles.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <button onClick={() => handleNavigate('/')} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">फोटो गैलरी</span>
      </nav>

      <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-6 h-6 text-amber-400" />
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            फोटो स्टोरीज & विजुअल गैलरी
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          घटनाओं, ग्राउंड रिपोर्ट और खास पलों की उच्च गुणवत्ता वाली तस्वीरों का संग्रह।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayArticles.map((art) => (
          <div
            key={art.id}
            className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div
              onClick={() => setActivePhoto(art.featuredImage)}
              className="aspect-16/10 relative overflow-hidden bg-slate-900 cursor-pointer group"
            >
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Camera className="w-3 h-3" />
                {art.gallery?.length ? `${art.gallery.length + 1} फोटोज` : 'फोटो स्टोरी'}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <h3
                onClick={() => handleArticleClick(art.slug)}
                className="font-serif font-bold text-base text-slate-900 hover:text-red-600 cursor-pointer line-clamp-2 mb-2 transition-colors"
              >
                {art.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-neutral-100">
                <span>{art.categoryName}</span>
                <span>{new Date(art.publishedAt || art.createdAt || Date.now()).toLocaleDateString('hi-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-0 text-white p-1 hover:text-red-400"
            >
              <X className="w-7 h-7" />
            </button>
            <img src={activePhoto} alt="Zoomed" className="max-h-[85vh] max-w-full rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
