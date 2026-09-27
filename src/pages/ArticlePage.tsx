import React, { useState, useEffect } from 'react';
import {
  Article,
  Category,
  Comment,
  SiteSettings,
} from '../types';
import { dbService } from '../services/db';
import { updateMetaTags, generateNewsArticleSchema, generateBreadcrumbSchema } from '../utils/seo';
import { AdBanner } from '../components/common/AdBanner';
import {
  Clock,
  Eye,
  Heart,
  Share2,
  Printer,
  Copy,
  Check,
  Send,
  MessageSquare,
  ChevronRight,
  User,
  Tag,
  MapPin,
  Flame,
} from 'lucide-react';

export interface ArticlePageProps {
  slug: string;
  articles?: Article[];
  categories?: Category[];
  siteSettings?: SiteSettings;
  onNavigate?: (path: string) => void;
  onArticleClick?: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
  onSelectCategory?: (slug: string) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  slug,
  articles: initialArticles,
  categories = [],
  siteSettings: initialSiteSettings,
  onNavigate,
  onArticleClick,
  onSelectArticle,
  onSelectCategory,
  onSelectAuthor,
}) => {
  const cleanSlug = typeof slug === 'string'
    ? decodeURIComponent(slug).replace(/^\/?(news\/)?/, '').replace(/\/$/, '').trim()
    : '';

  const [allArticles, setAllArticles] = useState<Article[]>(initialArticles || []);

  // Check if article is already in props/memory for instantaneous opening
  const initialFound = (initialArticles || []).find(
    (a) => a.slug === cleanSlug || a.id === cleanSlug || a.slug === slug || a.id === slug
  );

  const [article, setArticle] = useState<Article | null>(initialFound || null);
  const [loading, setLoading] = useState(!initialFound);
  const [comments, setComments] = useState<Comment[]>([]);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialFound?.likes || 0);
  const [copied, setCopied] = useState(false);

  const siteSettings = initialSiteSettings || dbService.getSiteSettings();

  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const handleArticleClick = (targetSlug: string) => {
    if (onSelectArticle) onSelectArticle(targetSlug);
    else if (onArticleClick) onArticleClick(targetSlug);
    else if (onNavigate) onNavigate(`/news/${targetSlug}`);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
    else if (path.startsWith('/category/') && onSelectCategory) onSelectCategory(path.replace('/category/', ''));
    else if (path.startsWith('/news/') && onSelectArticle) onSelectArticle(path.replace('/news/', ''));
  };

  useEffect(() => {
    if (!initialArticles || initialArticles.length === 0) {
      dbService.getArticles({ status: 'published' }).then((data) => {
        setAllArticles(data || []);
        // Also try matching if still not found
        if (!article) {
          const matched = (data || []).find(
            (a) => a.slug === cleanSlug || a.id === cleanSlug || a.slug === slug || a.id === slug
          );
          if (matched) {
            setArticle(matched);
            setLikesCount(matched.likes || 0);
            setLoading(false);
          }
        }
      });
    } else {
      setAllArticles(initialArticles);
    }
  }, [initialArticles, cleanSlug, slug, article]);

  useEffect(() => {
    let mounted = true;
    if (!cleanSlug) {
      setLoading(false);
      return;
    }

    const localFound = (initialArticles || allArticles || []).find(
      (a) => a.slug === cleanSlug || a.id === cleanSlug || a.slug === slug || a.id === slug
    );

    if (localFound) {
      setArticle(localFound);
      setLikesCount(localFound.likes || 0);
      setLoading(false);
    }

    dbService.getArticleBySlug(cleanSlug || slug).then((art) => {
      if (!mounted) return;
      if (art) {
        setArticle(art);
        setLikesCount(art.likes || 0);
        setLoading(false);

        // Increment view count
        dbService.incrementArticleViews(art.id);

        // Update meta tags for SEO
        updateMetaTags({
          title: `${art.title} | ${siteSettings.websiteName || 'Gadget Glow'}`,
          description: art.shortDescription || art.title,
          keywords: art.tags || [art.categoryName],
          image: art.featuredImage,
          url: `${window.location.origin}/news/${art.slug}`,
          type: 'article',
          publishedTime: art.publishedAt || art.createdAt,
          modifiedTime: art.updatedAt || art.publishedAt,
          author: art.authorName,
          section: art.categoryName,
        });

        // Inject JSON-LD Schema
        try {
          const schema = generateNewsArticleSchema(art, siteSettings, window.location.origin);
          let script = document.getElementById('article-json-ld');
          if (!script) {
            script = document.createElement('script');
            script.id = 'article-json-ld';
            script.setAttribute('type', 'application/ld+json');
            document.head.appendChild(script);
          }
          script.textContent = JSON.stringify(schema);
        } catch (e) {
          console.warn('Failed to inject JSON-LD schema', e);
        }

        // Fetch comments
        dbService.getComments(art.id).then((comms) => {
          if (mounted) setComments(comms || []);
        });
      } else {
        if (!localFound) {
          setLoading(false);
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      mounted = false;
      const script = document.getElementById('article-json-ld');
      if (script) script.remove();
    };
  }, [cleanSlug, slug, siteSettings, initialArticles]);

  if (loading && !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">खबर लोड हो रही है...</h2>
        <p className="text-slate-500 text-xs">कृपया कुछ सेकंड प्रतीक्षा करें...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white my-8 rounded-xl border border-neutral-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">खबर नहीं मिली (Article Not Found)</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          यह खबर हटा दी गई हो सकती है या लिंक अमान्य हो सकता है। कृपया अन्य प्रमुख खबरें देखें या होमपेज पर जाएं।
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleNavigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer"
          >
            होमपेज पर जाएं
          </button>
        </div>
      </div>
    );
  }

  const handleLike = async () => {
    if (!liked && article) {
      setLiked(true);
      const updated = await dbService.toggleLikeArticle(article.id);
      setLikesCount(updated);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentText) return;
    await dbService.addComment({
      articleId: article.id,
      articleTitle: article.title,
      userName: commentName,
      userEmail: commentEmail,
      comment: commentText,
    });
    setCommentSubmitted(true);
    setCommentName('');
    setCommentEmail('');
    setCommentText('');
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`${article.title} - गैजेट ग्लो (Gadget Glow)`);

  const safeArticles = allArticles || [];

  const relatedArticles = safeArticles
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId && a.status === 'published')
    .slice(0, 4);

  const trendingArticles = [...safeArticles]
    .filter((a) => a.id !== article.id && a.status === 'published')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const fontSizeClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
    xlarge: 'text-xl leading-loose',
  };

  return (
    <article className="max-w-7xl mx-auto px-4 py-6">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 overflow-x-auto">
        <a
          href="/"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              handleNavigate('/');
            }
          }}
          className="hover:text-red-600 shrink-0"
        >
          होम
        </a>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <a
          href={`/category/${article.categorySlug || article.categoryId}`}
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
              e.preventDefault();
              if (onSelectCategory) onSelectCategory(article.categorySlug || article.categoryId);
              else handleNavigate(`/category/${article.categorySlug || article.categoryId}`);
            }
          }}
          className="hover:text-red-600 shrink-0 text-red-600 font-semibold"
        >
          {article.categoryName}
        </a>
        {article.subcategoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-600 shrink-0">{article.subcategoryName}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
      </nav>

      {/* 2. Main Article Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl p-5 sm:p-8 shadow-xs transition-colors">
          {/* Category Badge & Breaking Flag */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-1 rounded">
              {article.categoryName}
            </span>
            {article.subcategoryName && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-1 rounded border border-neutral-200 dark:border-slate-700">
                {article.subcategoryName}
              </span>
            )}
            {article.isBreaking && (
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-xs">
                <Flame className="w-3.5 h-3.5" /> बड़ी खबर (Breaking News)
              </span>
            )}
          </div>

          {/* Headline (H1) */}
          <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subheading / Summary */}
          {article.shortDescription && (
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium leading-relaxed border-l-4 border-red-500 pl-4 py-1 mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-r-lg">
              {article.shortDescription}
            </p>
          )}

          {/* Metadata Row: Author, Date, Location, Read Time, Views */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-neutral-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div
                onClick={() => {
                  if (onSelectAuthor && article.authorId) onSelectAuthor(article.authorId);
                  else if (article.authorSlug) handleNavigate(`/author/${article.authorSlug}`);
                }}
                className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white hover:text-red-600 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>{article.authorName}</span>
              </div>

              {article.district && (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {article.district}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('hi-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>

              {article.readingTime && <span>• {article.readingTime} मिनट पढ़ाई</span>}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {(article.views || 0).toLocaleString()}
              </span>

              {/* Font Size Adjuster */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-neutral-200 dark:border-slate-700">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-1 font-bold ${fontSize === 'normal' ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  अ
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-1 font-bold text-sm ${fontSize === 'large' ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  अ+
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-1 font-bold text-base ${fontSize === 'xlarge' ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  अ++
                </button>
              </div>
            </div>
          </div>

          {/* Social Share & Action Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <a
              href={`https://api.whatsapp.com/send?text=${shareText}%20${currentUrl}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>व्हाट्सएप शेयर</span>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>फेसबुक</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${currentUrl}`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <span>X (Twitter)</span>
            </a>

            <button
              onClick={handlePrint}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              प्रिंट
            </button>

            <button
              onClick={handleCopyLink}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-slate-700 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'कॉपी हुआ!' : 'लिंक कॉपी'}
            </button>
          </div>

          {/* Article Top Ad */}
          <AdBanner position="article_top" />

          {/* Featured Image & Caption */}
          <div className="mb-6 rounded-xl overflow-hidden bg-slate-900">
            <img
              src={article.featuredImage}
              alt={article.imageAlt || article.title}
              className="w-full max-h-[500px] object-cover"
            />
            {(article.imageCaption || article.imageCredit) && (
              <div className="bg-slate-900/90 text-slate-300 text-xs px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>{article.imageCaption}</span>
                {article.imageCredit && <span className="text-slate-400 font-mono text-[11px]">फोटो: {article.imageCredit}</span>}
              </div>
            )}
          </div>

          {/* Full Article Rich Text Body */}
          <div
            className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${fontSizeClasses[fontSize]} space-y-4`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Multi Image Gallery if present */}
          {article.gallery && Array.isArray(article.gallery) && article.gallery.length > 0 && (
            <div className="my-8 bg-slate-50 border border-neutral-200 rounded-xl p-4">
              <h3 className="font-serif font-bold text-base text-slate-900 mb-3">फोटो गैलरी</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {article.gallery.map((imgUrl, i) => (
                  <div key={i} className="aspect-16/10 rounded overflow-hidden bg-slate-900">
                    <img src={imgUrl} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-Article Bottom Ad */}
          <AdBanner position="article_bottom" />

          {/* Tags */}
          {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="my-6 pt-4 border-t border-neutral-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                संबंधित विषय (Tags):
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(`/search?q=${encodeURIComponent(tag)}`)}
                    className="bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Like & Interaction Bar */}
          <div className="my-6 p-4 bg-slate-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                liked
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-rose-50 border border-neutral-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-white' : 'text-rose-600'}`} />
              <span>{likesCount} लोगों को खबर पसंद आई</span>
            </button>

            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Eye className="w-4 h-4" />
              <span>{(article.views || 0).toLocaleString()} कुल पाठक</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="my-8 pt-6 border-t border-neutral-200">
            <h3 className="font-serif font-black text-xl text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              पाठकों की प्रतिक्रिया ({comments.length})
            </h3>

            {/* Comment List */}
            {comments.length > 0 ? (
              <div className="space-y-3 mb-6">
                {comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 border border-neutral-200 rounded-lg p-3.5">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-bold text-slate-900">{c.userName}</span>
                      <span className="text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{c.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-6 italic">अभी तक कोई टिप्पणी नहीं है। सबसे पहले अपनी राय साझा करें।</p>
            )}

            {/* Post Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-slate-800/80 border border-neutral-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">अपनी राय लिखें</h4>
              {commentSubmitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 p-3 rounded text-xs border border-emerald-200 dark:border-emerald-800">
                  आपकी टिप्पणी सफलतापूर्वक दर्ज हो गई है। संपादकीय समीक्षा के बाद यह प्रकाशित होगी।
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="आपका नाम (Name)*"
                      className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="email"
                      required
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="ईमेल पता (Email)*"
                      className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="अपनी टिप्पणी यहां लिखें..."
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 rounded focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    टिप्पणी भेजें
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar (Right 4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Sidebar Ad */}
          <AdBanner position="sidebar" />

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
              <h3 className="font-serif font-black text-base text-slate-900 dark:text-white pb-2 mb-3 border-b border-neutral-200 dark:border-slate-800 flex items-center justify-between">
                <span>संबंधित खबरें</span>
                <span className="text-xs text-red-600 dark:text-red-400 font-sans font-bold">{article.categoryName}</span>
              </h3>

              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <a
                    key={rel.id}
                    href={`/news/${encodeURIComponent(rel.slug)}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                        e.preventDefault();
                        handleArticleClick(rel.slug);
                      }
                    }}
                    className="group cursor-pointer flex gap-3 items-center block"
                  >
                    <div className="w-20 h-16 shrink-0 rounded overflow-hidden bg-slate-900">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-red-600 line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(rel.publishedAt || rel.createdAt).toLocaleDateString('hi-IN')}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Top Trending in Portal */}
          <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
            <h3 className="font-serif font-black text-base text-slate-900 dark:text-white pb-2 mb-3 border-b border-neutral-200 dark:border-slate-800">
              ट्रेंडिंग समाचार (Top 5)
            </h3>

            <div className="space-y-3">
              {trendingArticles.map((t, idx) => (
                <a
                  key={t.id}
                  href={`/news/${encodeURIComponent(t.slug)}`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                      e.preventDefault();
                      handleArticleClick(t.slug);
                    }
                  }}
                  className="group cursor-pointer flex items-start gap-2.5 block"
                >
                  <span className="font-black font-serif text-xl text-neutral-300 dark:text-slate-700 group-hover:text-red-600 transition-colors w-6 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-red-600 uppercase block">{t.categoryName}</span>
                    <h4 className="font-serif font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-red-600 line-clamp-2 leading-snug">
                      {t.title}
                    </h4>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
};
