import React from 'react';
import { Article, Category, Subcategory, VideoNews } from '../types';
import { HeroSection } from '../components/home/HeroSection';
import { HaryanaDistrictSection } from '../components/home/HaryanaDistrictSection';
import { PoliticsCrimeSection } from '../components/home/PoliticsCrimeSection';
import { VideoSection } from '../components/home/VideoSection';
import { TrendingSection } from '../components/home/TrendingSection';
import { AdBanner } from '../components/common/AdBanner';
import { Clock, ChevronRight } from 'lucide-react';

export interface HomePageProps {
  articles?: Article[];
  categories?: Category[];
  subcategories?: Subcategory[];
  videos?: VideoNews[];
  breakingNews?: any[];
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onSelectCategory?: (slug: string) => void;
  onSelectVideo?: () => void;
  onSelectDistrict?: (dist: any) => void;
  onNavigateEPaper?: () => void;
  onNavigateVideos?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles = [],
  categories = [],
  subcategories = [],
  videos = [],
  onArticleClick,
  onSelectArticle,
  onNavigate,
  onSelectCategory,
  onNavigateEPaper,
  onNavigateVideos,
}) => {
  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
    else if (path.startsWith('/category/') && onSelectCategory) onSelectCategory(path.replace('/category/', ''));
    else if (path.startsWith('/news/') && onSelectArticle) onSelectArticle(path.replace('/news/', ''));
    else if ((path === '/e-paper' || path === '/epaper') && onNavigateEPaper) onNavigateEPaper();
    else if (path === '/videos' && onNavigateVideos) onNavigateVideos();
  };

  const handleNavigateCategory = (slug: string) => {
    if (onSelectCategory) onSelectCategory(slug);
    else if (onNavigate) onNavigate(`/category/${slug}`);
  };

  const publishedArticles = (articles || []).filter((a) => a.status === 'published');
  const latestArticles = [...publishedArticles].sort(
    (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* 1. Header Advertisement Slot */}
      <AdBanner position="header" />

      {/* 2. Hero Headlines & Top Stories */}
      <HeroSection articles={publishedArticles} onArticleClick={handleArticleClick} />

      {/* 3. Haryana District Special Section */}
      <HaryanaDistrictSection
        articles={publishedArticles}
        subcategories={subcategories || []}
        onArticleClick={handleArticleClick}
        onNavigateToCategory={handleNavigateCategory}
      />

      {/* 4. Homepage Middle Advertisement */}
      <AdBanner position="homepage_middle" />

      {/* 5. Politics & Crime Section */}
      <PoliticsCrimeSection
        articles={publishedArticles}
        onArticleClick={handleArticleClick}
        onNavigateToCategory={handleNavigateCategory}
      />

      {/* 6. Video News Section */}
      <VideoSection
        videos={videos || []}
        onNavigateToVideos={() => (onNavigateVideos ? onNavigateVideos() : handleNavigate('/videos'))}
      />

      {/* 7. Trending Top Stories Section */}
      <TrendingSection articles={publishedArticles} onArticleClick={handleArticleClick} />

      {/* 8. Latest Feed + Category Spotlights */}
      <section className="my-8">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-6 bg-red-600 rounded-xs"></span>
            <h2 className="font-serif font-black text-xl text-slate-900">
              ताजा खबरें (Latest News Feed)
            </h2>
          </div>
          <a
            href="/latest-news"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                handleNavigate('/latest-news');
              }
            }}
            className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
          >
            सभी ताजा खबरें <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(latestArticles || []).slice(0, 8).map((art) => (
            <a
              key={art.id}
              href={`/news/${encodeURIComponent(art.slug)}`}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                  e.preventDefault();
                  handleArticleClick(art.slug);
                }
              }}
              className="group cursor-pointer bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col justify-between block"
            >
              <div className="aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-600 uppercase mb-1 block">
                    {art.categoryName}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-neutral-100">
                  <span>{art.authorName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(art.publishedAt || art.createdAt).toLocaleTimeString('hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
