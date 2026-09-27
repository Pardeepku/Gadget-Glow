import React from 'react';
import { Article } from '../../types';
import { Clock, Eye, Flame, Share2 } from 'lucide-react';

interface HeroSectionProps {
  articles: Article[];
  onArticleClick: (slug: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ articles, onArticleClick }) => {
  if (!articles || articles.length === 0) return null;

  const mainStory = articles.find((a) => a.isFeatured) || articles[0];
  const sideStories = articles.filter((a) => a.id !== mainStory.id).slice(0, 4);

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'हाल ही में';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <section className="my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story (Left 7 Cols) */}
        <div className="lg:col-span-7">
          <a
            href={`/news/${encodeURIComponent(mainStory.slug)}`}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                onArticleClick(mainStory.slug);
              }
            }}
            className="group cursor-pointer bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col h-full block"
          >
            <div className="relative aspect-16/9 overflow-hidden bg-slate-900">
              <img
                src={mainStory.featuredImage}
                alt={mainStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-red-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded shadow-md">
                  {mainStory.categoryName}
                </span>
                {mainStory.isBreaking && (
                  <span className="bg-slate-900 text-amber-300 font-bold text-xs px-2.5 py-1 rounded shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> बड़ी खबर
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h1 className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-slate-900 leading-tight group-hover:text-red-600 transition-colors mb-3">
                  {mainStory.title}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4">
                  {mainStory.shortDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-neutral-100 pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">{mainStory.authorName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(mainStory.publishedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {mainStory.views.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Side Important Stories (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-red-50 border-l-4 border-red-600 px-3 py-2 text-sm font-bold text-red-900 flex items-center justify-between">
            <span>प्रमुख सुर्खियां (Top Stories)</span>
            <span className="text-xs text-red-700">गैजेट ग्लो विशेष</span>
          </div>

          <div className="space-y-3.5">
            {sideStories.map((story) => (
              <a
                key={story.id}
                href={`/news/${encodeURIComponent(story.slug)}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                    e.preventDefault();
                    onArticleClick(story.slug);
                  }
                }}
                className="group cursor-pointer bg-white p-3 rounded-lg border border-neutral-200 hover:border-red-300 hover:shadow-xs transition-all flex gap-3.5 items-center block"
              >
                <div className="w-24 sm:w-28 h-20 shrink-0 rounded overflow-hidden bg-slate-900">
                  <img
                    src={story.featuredImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-red-600 uppercase">
                      {story.categoryName}
                    </span>
                    {story.location && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        📍 {story.location}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                    {story.title}
                  </h3>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(story.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
