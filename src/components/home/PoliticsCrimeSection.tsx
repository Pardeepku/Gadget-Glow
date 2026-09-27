import React from 'react';
import { Article } from '../../types';
import { ShieldAlert, Landmark, ChevronRight, Clock } from 'lucide-react';

interface PoliticsCrimeSectionProps {
  articles: Article[];
  onArticleClick: (slug: string) => void;
  onNavigateToCategory: (slug: string) => void;
}

export const PoliticsCrimeSection: React.FC<PoliticsCrimeSectionProps> = ({
  articles,
  onArticleClick,
  onNavigateToCategory,
}) => {
  const politics = articles.filter((a) => a.categoryId === 'cat-rajneeti' || a.tags.includes('राजनीति')).slice(0, 3);
  const crime = articles.filter((a) => a.categoryId === 'cat-apradh' || a.tags.includes('अपराध') || a.tags.includes('क्राइम')).slice(0, 3);

  const fallbackPolitics = politics.length > 0 ? politics : articles.slice(0, 3);
  const fallbackCrime = crime.length > 0 ? crime : articles.slice(3, 6);

  return (
    <section className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Politics Column */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <h2 className="font-serif font-black text-xl text-slate-900">सियासत & राजनीति</h2>
          </div>
          <a
            href="/category/rajneeti"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onNavigateToCategory('rajneeti');
              }
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
          >
            और देखें <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4">
          {fallbackPolitics.map((art) => (
            <a
              key={art.id}
              href={`/news/${encodeURIComponent(art.slug)}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  onArticleClick(art.slug);
                }
              }}
              className="group cursor-pointer flex gap-3.5 items-center pb-3 border-b border-neutral-100 last:border-0 last:pb-0 block"
            >
              <div className="w-24 h-18 shrink-0 rounded overflow-hidden bg-slate-900">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{art.authorName}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Crime Column */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="font-serif font-black text-xl text-slate-900">क्राइम & खुलासे</h2>
          </div>
          <a
            href="/category/apradh"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onNavigateToCategory('apradh');
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
          >
            और देखें <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-4">
          {fallbackCrime.map((art) => (
            <a
              key={art.id}
              href={`/news/${encodeURIComponent(art.slug)}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  onArticleClick(art.slug);
                }
              }}
              className="group cursor-pointer flex gap-3.5 items-center pb-3 border-b border-neutral-100 last:border-0 last:pb-0 block"
            >
              <div className="w-24 h-18 shrink-0 rounded overflow-hidden bg-slate-900">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  {art.location && <span className="text-rose-600 font-medium">📍 {art.location}</span>}
                  <span>•</span>
                  <span>{art.authorName}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
