import React, { useState } from 'react';
import { Article, Subcategory } from '../../types';
import { MapPin, ChevronRight, Clock, Eye } from 'lucide-react';

interface HaryanaDistrictSectionProps {
  articles?: Article[];
  subcategories?: Subcategory[];
  onArticleClick: (slug: string) => void;
  onNavigateToCategory: (slug: string) => void;
}

export const HaryanaDistrictSection: React.FC<HaryanaDistrictSectionProps> = ({
  articles = [],
  subcategories = [],
  onArticleClick,
  onNavigateToCategory,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const safeArticles = articles || [];
  const safeSubcategories = subcategories || [];

  const haryanaArticles = safeArticles.filter(
    (a) =>
      a.categoryId === 'cat-haryana' ||
      (Array.isArray(a.tags) && a.tags.includes('हरियाणा')) ||
      (a.district && a.district.length > 0) ||
      (a.location && a.location.includes('हरियाणा'))
  );

  const filtered =
    selectedDistrict === 'all'
      ? haryanaArticles
      : haryanaArticles.filter(
          (a) =>
            a.subcategoryId === selectedDistrict ||
            a.subcategoryName === selectedDistrict ||
            a.district === selectedDistrict ||
            a.location === selectedDistrict
        );

  const displayList = filtered.length > 0 ? filtered : haryanaArticles;

  return (
    <section className="my-8 bg-slate-50 border border-neutral-200 rounded-xl p-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-6 bg-red-600 rounded-xs"></span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
            हरियाणा विशेष (District Special)
          </h2>
        </div>

        <a
          href="/category/haryana"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              onNavigateToCategory('haryana');
            }
          }}
          className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          हरियाणा की सभी खबरें देखें
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* District Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-b border-neutral-200/60">
        <button
          onClick={() => setSelectedDistrict('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
            selectedDistrict === 'all'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-neutral-200'
          }`}
        >
          सभी जिले (All Districts)
        </button>

        {safeSubcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedDistrict(sub.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
              selectedDistrict === sub.id
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-neutral-200'
            }`}
          >
            <MapPin className="w-3 h-3 text-slate-400" />
            {sub.nameHi} ({sub.name})
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {displayList.slice(0, 6).map((art) => (
          <a
            key={art.id}
            href={`/news/${encodeURIComponent(art.slug)}`}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onArticleClick(art.slug);
              }
            }}
            className="group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col justify-between block"
          >
            <div className="aspect-16/10 overflow-hidden relative bg-slate-900">
              <img
                src={art.featuredImage}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {art.subcategoryName || art.district || art.location || 'हरियाणा'}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{art.shortDescription}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-neutral-100">
                <span>{art.authorName}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {(art.views || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
