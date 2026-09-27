import React, { useEffect, useState } from 'react';
import { Author, Article } from '../types';
import { dbService } from '../services/db';
import { User, MapPin, Mail, Twitter, Facebook, Clock, ChevronRight } from 'lucide-react';

interface AuthorPageProps {
  authorId?: string;
  authorSlug?: string;
  authors?: Author[];
  categories?: any[];
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onSelectCategory?: (slug: string) => void;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({
  authorId,
  authorSlug,
  onArticleClick,
  onSelectArticle,
  onNavigate,
  onSelectCategory,
}) => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const targetId = authorSlug || authorId || '';

  const handleArticleClick = (slug: string) => {
    if (onSelectArticle) onSelectArticle(slug);
    else if (onArticleClick) onArticleClick(slug);
  };

  useEffect(() => {
    let mounted = true;
    dbService.getAuthors().then((authors) => {
      if (!mounted) return;
      const found = authors.find((a) => a.id === targetId || a.slug === targetId);
      if (found) {
        setAuthor(found);
        dbService.getArticles({ authorId: found.id, status: 'published' }).then((arts) => {
          if (mounted) setArticles(arts);
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [targetId]);

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        लेखक प्रोफ़ाइल लोड हो रही है...
      </div>
    );
  }

  const authorPhoto = author.photo || author.photoURL;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <button onClick={() => onNavigate ? onNavigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">संपादकीय टीम</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600">{author.name}</span>
      </nav>

      {/* Author Bio Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 border-2 border-red-600 shadow-md">
          {authorPhoto ? (
            <img src={authorPhoto} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <h1 className="font-serif font-black text-2xl text-slate-900">{author.name}</h1>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">{author.designation}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">{author.bio}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 border-t border-neutral-100 pt-3">
            {author.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {author.location}
              </span>
            )}
            {author.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {author.email}
              </span>
            )}
            {author.socialLinks?.twitter && (
              <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 flex items-center gap-1">
                <Twitter className="w-3.5 h-3.5" /> Twitter
              </a>
            )}
            {author.socialLinks?.facebook && (
              <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 flex items-center gap-1">
                <Facebook className="w-3.5 h-3.5" /> Facebook
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Articles by Author */}
      <div>
        <h2 className="font-serif font-black text-xl text-slate-900 pb-3 mb-6 border-b border-neutral-200">
          {author.name} द्वारा प्रकाशित खबरें ({articles.length})
        </h2>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
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
                      className="text-[10px] font-bold text-red-600 uppercase mb-1 block hover:underline"
                    >
                      {art.categoryName}
                    </button>
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{art.shortDescription}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-neutral-100">
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
          <div className="bg-white p-8 text-center text-slate-500 text-sm border rounded-lg">
            अभी तक कोई प्रकाशित खबर नहीं है।
          </div>
        )}
      </div>
    </div>
  );
};
