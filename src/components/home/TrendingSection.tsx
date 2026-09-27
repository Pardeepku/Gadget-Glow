import React from 'react';
import { Article } from '../../types';
import { TrendingUp, Eye } from 'lucide-react';

interface TrendingSectionProps {
  articles: Article[];
  onArticleClick: (slug: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ articles, onArticleClick }) => {
  // Sort by views descending
  const sorted = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 6);

  return (
    <section className="my-8 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-neutral-200">
        <TrendingUp className="w-6 h-6 text-red-600" />
        <h2 className="font-serif font-black text-xl text-slate-900">
          ट्रेंडिंग और सबसे ज्यादा पढ़ी गई खबरें (Top Trending)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((art, index) => (
          <a
            key={art.id}
            href={`/news/${encodeURIComponent(art.slug)}`}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onArticleClick(art.slug);
              }
            }}
            className="group cursor-pointer flex items-start gap-3 p-3 rounded-lg hover:bg-red-50/50 transition-colors border border-transparent hover:border-red-100 block"
          >
            <span className="font-serif font-black text-3xl text-neutral-300 group-hover:text-red-600 transition-colors w-8 text-right shrink-0">
              0{index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-red-600 uppercase mb-1 block">
                {art.categoryName}
              </span>
              <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                {art.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {art.views.toLocaleString()} पाठक
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
