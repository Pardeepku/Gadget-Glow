import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { dbService, getLocalCustomArticles } from './services/db';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_AUTHORS,
  INITIAL_BREAKING_NEWS,
  INITIAL_ARTICLES,
  INITIAL_VIDEOS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_EPAPER_EDITIONS,
  INITIAL_SITE_SETTINGS,
  INITIAL_SEO_SETTINGS,
} from './data/initialData';
import {
  parseRouteFromLocation,
  buildUrl,
  navigateToUrl,
  AppRoute,
} from './utils/router';
import {
  Article,
  Category,
  Subcategory,
  Author,
  VideoNews,
  BreakingNews,
  Advertisement,
  EPaperEdition,
  SeoSettings,
  SiteSettings,
  ActivityLog,
} from './types';

// Layout & Common
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { AuthorPage } from './pages/AuthorPage';
import { VideosPage } from './pages/VideosPage';
import { PhotosPage } from './pages/PhotosPage';
import { EPaperPage } from './pages/EPaperPage';
import { StaticPage, StaticPageType } from './pages/StaticPages';
import { SitemapPage } from './pages/SitemapPage';

// Admin Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { ArticleManager } from './components/admin/ArticleManager';
import { ArticleEditorModal } from './components/admin/ArticleEditorModal';
import { BreakingNewsManager } from './components/admin/BreakingNewsManager';
import { CategoryManager } from './components/admin/CategoryManager';
import { AuthorManager } from './components/admin/AuthorManager';
import { VideoManager } from './components/admin/VideoManager';
import { EPaperManager } from './components/admin/EPaperManager';
import { AdManager } from './components/admin/AdManager';
import { SeoSettingsManager } from './components/admin/SeoSettingsManager';
import { SiteSettingsManager } from './components/admin/SiteSettingsManager';
import { ActivityLogViewer } from './components/admin/ActivityLogViewer';
import { AutoNewsFetcher } from './components/admin/AutoNewsFetcher';
import { AiImageStudio } from './components/admin/AiImageStudio';
import { AiModelsSettingsManager } from './components/admin/AiModelsSettingsManager';
import { UserManager } from './components/admin/UserManager';

export type AppView =
  | 'home'
  | 'article'
  | 'category'
  | 'search'
  | 'author'
  | 'videos'
  | 'photos'
  | 'epaper'
  | 'static'
  | 'sitemap'
  | 'admin_login'
  | 'admin';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();

  // Route State initialized from real URL
  const initialRoute = parseRouteFromLocation();
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [activeSlug, setActiveSlug] = useState<string>(initialRoute.activeSlug || '');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(initialRoute.activeCategorySlug || '');
  const [activeAuthorSlug, setActiveAuthorSlug] = useState<string>(initialRoute.activeAuthorSlug || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialRoute.searchQuery || '');
  const [staticPageType, setStaticPageType] = useState<StaticPageType>(initialRoute.staticPageType || 'about');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Modal State for Article Editor
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Dynamic Data Store States (Initialized immediately with complete news data for 0ms initial load)
  const [articles, setArticles] = useState<Article[]>(() => {
    const local = getLocalCustomArticles();
    if (local && local.length > 0) {
      const existingIds = new Set(local.map((a) => a.id));
      return [...local, ...INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id))];
    }
    return INITIAL_ARTICLES;
  });
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(INITIAL_SUBCATEGORIES);
  const [authors, setAuthors] = useState<Author[]>(INITIAL_AUTHORS);
  const [videos, setVideos] = useState<VideoNews[]>(INITIAL_VIDEOS);
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>(INITIAL_BREAKING_NEWS);
  const [ads, setAds] = useState<Advertisement[]>(INITIAL_ADVERTISEMENTS);
  const [epaperEditions, setEpaperEditions] = useState<EPaperEdition[]>(INITIAL_EPAPER_EDITIONS);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(INITIAL_SEO_SETTINGS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh all state from DB in background
  const refreshData = async () => {
    try {
      const [
        fetchedArticles,
        fetchedCategories,
        fetchedSubcategories,
        fetchedAuthors,
        fetchedVideos,
        fetchedBreaking,
        fetchedAds,
        fetchedEpaper,
        fetchedSeo,
        fetchedSite,
        fetchedLogs,
      ] = await Promise.all([
        dbService.getArticles({ limit: 100 }),
        dbService.getCategories(),
        dbService.getSubcategories(),
        dbService.getAuthors(),
        dbService.getVideos(),
        dbService.getBreakingNews(),
        dbService.getAds(),
        dbService.getEPaperEditions(),
        dbService.getSeoSettings(),
        dbService.getSiteSettings(),
        dbService.getActivityLogs(),
      ]);

      if (fetchedArticles && fetchedArticles.length > 0) {
        const existingIds = new Set(fetchedArticles.map((a) => a.id));
        const combined = [...fetchedArticles, ...INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id))];
        setArticles(combined);
      }
      if (fetchedCategories && fetchedCategories.length > 0) setCategories(fetchedCategories);
      if (fetchedSubcategories && fetchedSubcategories.length > 0) setSubcategories(fetchedSubcategories);
      if (fetchedAuthors && fetchedAuthors.length > 0) setAuthors(fetchedAuthors);
      if (fetchedVideos && fetchedVideos.length > 0) setVideos(fetchedVideos);
      if (fetchedBreaking && fetchedBreaking.length > 0) setBreakingNews(fetchedBreaking);
      if (fetchedAds && fetchedAds.length > 0) setAds(fetchedAds);
      if (fetchedEpaper && fetchedEpaper.length > 0) setEpaperEditions(fetchedEpaper);
      if (fetchedSeo) setSeoSettings(fetchedSeo);
      if (fetchedSite) setSiteSettings(fetchedSite);
      if (fetchedLogs && fetchedLogs.length > 0) setActivityLogs(fetchedLogs);
    } catch (err) {
      console.warn('Error refreshing data from DB, keeping initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync state on browser Back/Forward (popstate) and router navigation events
  useEffect(() => {
    const handleLocationChange = () => {
      const route = parseRouteFromLocation();
      setCurrentView(route.view);
      if (route.activeSlug !== undefined) setActiveSlug(route.activeSlug);
      if (route.activeCategorySlug !== undefined) setActiveCategorySlug(route.activeCategorySlug);
      if (route.activeAuthorSlug !== undefined) setActiveAuthorSlug(route.activeAuthorSlug);
      if (route.searchQuery !== undefined) setSearchQuery(route.searchQuery);
      if (route.staticPageType !== undefined) setStaticPageType(route.staticPageType);
    };

    const handleStoreUpdate = () => {
      refreshData();
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('app_route_change', handleLocationChange);
    window.addEventListener('samachar_store_updated', handleStoreUpdate);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('app_route_change', handleLocationChange);
      window.removeEventListener('samachar_store_updated', handleStoreUpdate);
    };
  }, []);

  // Update browser Document Title according to the current URL & view
  useEffect(() => {
    if (currentView === 'home') {
      document.title = 'समाचार FIRST - आपकी खबर, सबसे पहले | Hindi News Portal';
    } else if (currentView === 'article' && activeSlug) {
      const currentArt = articles.find((a) => a.slug === activeSlug || a.id === activeSlug);
      document.title = currentArt ? `${currentArt.title} - समाचार FIRST` : 'समाचार - समाचार FIRST';
    } else if (currentView === 'category' && activeCategorySlug) {
      const cat = categories.find((c) => c.slug === activeCategorySlug || c.id === activeCategorySlug);
      document.title = cat ? `${cat.nameHi} समाचार - समाचार FIRST` : 'श्रेणी - समाचार FIRST';
    } else if (currentView === 'search') {
      document.title = searchQuery ? `खोज: "${searchQuery}" - समाचार FIRST` : 'खोज - समाचार FIRST';
    } else if (currentView === 'videos') {
      document.title = 'वीडियो बुलेटिन - समाचार FIRST';
    } else if (currentView === 'photos') {
      document.title = 'फोटो गैलरी - समाचार FIRST';
    } else if (currentView === 'epaper') {
      document.title = 'डिजिटल ई-पेपर - समाचार FIRST';
    } else if (currentView === 'static') {
      const titles: Record<string, string> = {
        about: 'हमारे बारे में',
        contact: 'संपर्क करें',
        privacy: 'गोपनीयता नीति',
        terms: 'नियम एवं शर्तें',
        disclaimer: 'अस्वीकरण',
        'editorial-policy': 'संपादकीय नीति',
      };
      document.title = `${titles[staticPageType] || 'पृष्ठ'} - समाचार FIRST`;
    } else if (currentView === 'admin' || currentView === 'admin_login') {
      document.title = 'CMS एडमिन पोर्टल - समाचार FIRST';
    }
  }, [currentView, activeSlug, activeCategorySlug, searchQuery, staticPageType, articles, categories]);

  // Handle Navigation with real URL pushes
  const navigateToHome = () => {
    setCurrentView('home');
    navigateToUrl('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToArticle = (rawSlug: string) => {
    if (!rawSlug) return;
    const cleanSlug = typeof rawSlug === 'string'
      ? decodeURIComponent(rawSlug).replace(/^\/?(news\/)?/, '').replace(/\/$/, '').trim()
      : String(rawSlug);
    setActiveSlug(cleanSlug);
    setCurrentView('article');
    navigateToUrl(`/news/${encodeURIComponent(cleanSlug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    const cleanSlug = typeof slug === 'string'
      ? decodeURIComponent(slug).replace(/^\/?(category\/)?/, '').replace(/\/$/, '').trim()
      : String(slug);
    setActiveCategorySlug(cleanSlug);
    setCurrentView('category');
    navigateToUrl(`/category/${encodeURIComponent(cleanSlug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    navigateToUrl(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAuthor = (slug: string) => {
    const cleanSlug = typeof slug === 'string'
      ? decodeURIComponent(slug).replace(/^\/?(author\/)?/, '').replace(/\/$/, '').trim()
      : String(slug);
    setActiveAuthorSlug(cleanSlug);
    setCurrentView('author');
    navigateToUrl(`/author/${encodeURIComponent(cleanSlug)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToVideos = () => {
    setCurrentView('videos');
    navigateToUrl('/videos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPhotos = () => {
    setCurrentView('photos');
    navigateToUrl('/photos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToEPaper = () => {
    setCurrentView('epaper');
    navigateToUrl('/e-paper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStatic = (type: StaticPageType) => {
    setStaticPageType(type);
    setCurrentView('static');
    navigateToUrl(`/${type}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSitemap = () => {
    setCurrentView('sitemap');
    navigateToUrl('/sitemap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    if (!currentUser) {
      setCurrentView('admin_login');
      navigateToUrl('/admin/login');
    } else {
      setCurrentView('admin');
      navigateToUrl('/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // General URL dispatcher for internal links across Header, Footer, and Content
  const handleNavigate = (path: string) => {
    if (!path || path === '/' || path === '/home') {
      navigateToHome();
    } else if (path.startsWith('/news/')) {
      navigateToArticle(path.replace('/news/', ''));
    } else if (path.startsWith('/category/')) {
      navigateToCategory(path.replace('/category/', ''));
    } else if (path.startsWith('/author/')) {
      navigateToAuthor(path.replace('/author/', ''));
    } else if (path.startsWith('/search')) {
      const match = path.match(/q=([^&]*)/);
      navigateToSearch(match ? decodeURIComponent(match[1]) : '');
    } else if (path === '/videos') {
      navigateToVideos();
    } else if (path === '/photos') {
      navigateToPhotos();
    } else if (path === '/e-paper' || path === '/epaper') {
      navigateToEPaper();
    } else if (
      path === '/about' ||
      path === '/contact' ||
      path === '/privacy' ||
      path === '/terms' ||
      path === '/disclaimer' ||
      path === '/editorial-policy'
    ) {
      navigateToStatic(path.replace('/', '') as StaticPageType);
    } else if (path === '/sitemap') {
      navigateToSitemap();
    } else if (path.startsWith('/admin')) {
      navigateToAdmin();
    } else {
      navigateToHome();
    }
  };

  // Article Actions
  const handleOpenCreateArticle = () => {
    setEditingArticle(null);
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsArticleModalOpen(true);
  };

  const handleOpenArticleWithPrefill = (articleData: Partial<Article>) => {
    setEditingArticle(articleData as Article);
    setIsArticleModalOpen(true);
  };

  const handleDirectPublishArticle = async (articleData: Omit<Article, 'id'>): Promise<Article> => {
    const saved = await dbService.createArticle(
      articleData,
      currentUser?.displayName || 'गैजेट ग्लो बॉट (AI Auto-Sync)'
    );
    // Immediately update state so article appears on the website instantly
    setArticles((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    // Background refresh for other collections without blocking
    refreshData().catch(console.warn);
    return saved;
  };

  const handleSaveArticle = async (articleData: Partial<Article>) => {
    if (editingArticle && editingArticle.id) {
      await dbService.updateArticle(
        editingArticle.id,
        articleData,
        currentUser?.displayName || 'संपादक'
      );
    } else {
      await dbService.createArticle(
        articleData as any,
        currentUser?.displayName || 'संपादक'
      );
    }
    await refreshData();
  };

  const handleDeleteArticle = async (id: string) => {
    await dbService.deleteArticle(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleToggleArticleStatus = async (id: string, newStatus: 'published' | 'draft') => {
    await dbService.updateArticle(
      id,
      { status: newStatus },
      currentUser?.displayName || 'संपादक'
    );
    await refreshData();
  };

  // Breaking News Actions
  const handleAddBreaking = async (item: Omit<BreakingNews, 'id' | 'createdAt'>) => {
    await dbService.addBreakingNews(item, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleUpdateBreaking = async (id: string, item: Partial<BreakingNews>) => {
    await dbService.updateBreakingNews(id, item, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteBreaking = async (id: string) => {
    await dbService.deleteBreakingNews(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // Category Actions
  const handleAddCategory = async (cat: Omit<Category, 'id'>) => {
    await dbService.addCategory(cat, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleUpdateCategory = async (id: string, cat: Partial<Category>) => {
    await dbService.updateCategory(id, cat, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    await dbService.deleteCategory(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleAddSubcategory = async (sub: Omit<Subcategory, 'id'>) => {
    await dbService.addSubcategory(sub, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteSubcategory = async (id: string) => {
    await dbService.deleteSubcategory(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // Author Actions
  const handleAddAuthor = async (author: Omit<Author, 'id'>) => {
    await dbService.addAuthor(author, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleUpdateAuthor = async (id: string, author: Partial<Author>) => {
    await dbService.updateAuthor(id, author, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteAuthor = async (id: string) => {
    await dbService.deleteAuthor(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // Video Actions
  const handleAddVideo = async (vid: Omit<VideoNews, 'id' | 'views'>) => {
    await dbService.addVideo(vid, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteVideo = async (id: string) => {
    await dbService.deleteVideo(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // EPaper Actions
  const handleAddEPaper = async (edition: Omit<EPaperEdition, 'id'>) => {
    await dbService.addEPaperEdition(edition, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteEPaper = async (id: string) => {
    await dbService.deleteEPaperEdition(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // Ad Actions
  const handleAddAd = async (ad: Omit<Advertisement, 'id' | 'createdAt'>) => {
    await dbService.addAd(ad, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleUpdateAd = async (id: string, ad: Partial<Advertisement>) => {
    await dbService.updateAd(id, ad, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleDeleteAd = async (id: string) => {
    await dbService.deleteAd(id, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // SEO & Settings Actions
  const handleSaveSeo = async (settings: SeoSettings) => {
    await dbService.updateSeoSettings(settings, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  const handleSaveSiteSettings = async (settings: SiteSettings) => {
    await dbService.updateSiteSettings(settings, currentUser?.displayName || 'संपादक');
    await refreshData();
  };

  // Auto redirect from login to admin if user logs in
  useEffect(() => {
    if (currentView === 'admin_login' && currentUser) {
      setCurrentView('admin');
    }
  }, [currentUser, currentView]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-red-600 selection:text-white">
      {/* 1. ADMIN LOGIN VIEW */}
      {currentView === 'admin_login' && (
        <AdminLogin onBackToSite={navigateToHome} />
      )}

      {/* 2. CMS / ADMIN CONTROL PANEL VIEW */}
      {currentView === 'admin' && currentUser && (
        <AdminLayout
          activeTab={adminTab}
          onSelectTab={setAdminTab}
          onNavigateToPublic={navigateToHome}
          onCreateArticle={handleOpenCreateArticle}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              articles={articles}
              categories={categories}
              authors={authors}
              videos={videos}
              breakingNews={breakingNews}
              activityLogs={activityLogs}
              onNavigateTab={setAdminTab}
              onCreateArticle={handleOpenCreateArticle}
              onEditArticle={handleOpenEditArticle}
              onRefreshData={refreshData}
            />
          )}

          {adminTab === 'articles' && (
            <ArticleManager
              articles={articles}
              categories={categories}
              subcategories={subcategories}
              authors={authors}
              onCreateArticle={handleOpenCreateArticle}
              onEditArticle={handleOpenEditArticle}
              onDeleteArticle={handleDeleteArticle}
              onToggleStatus={handleToggleArticleStatus}
              onViewLiveArticle={navigateToArticle}
              onNavigateAutoFetch={() => setAdminTab('auto_fetch')}
            />
          )}

          {adminTab === 'auto_fetch' && (
            <AutoNewsFetcher
              categories={categories}
              subcategories={subcategories}
              authors={authors}
              onPublishArticle={handleDirectPublishArticle}
              onOpenArticleEditor={handleOpenArticleWithPrefill}
              onViewLiveArticle={navigateToArticle}
            />
          )}

          {adminTab === 'ai_images' && (
            <AiImageStudio
              articles={articles}
              onOpenArticleEditor={handleOpenArticleWithPrefill}
              onNavigateAiSettings={() => setAdminTab('ai_models')}
            />
          )}

          {adminTab === 'ai_models' && (
            <AiModelsSettingsManager />
          )}

          {adminTab === 'breaking' && (
            <BreakingNewsManager
              breakingNews={breakingNews}
              onAdd={handleAddBreaking}
              onUpdate={handleUpdateBreaking}
              onDelete={handleDeleteBreaking}
            />
          )}

          {adminTab === 'categories' && (
            <CategoryManager
              categories={categories}
              subcategories={subcategories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddSubcategory={handleAddSubcategory}
              onDeleteSubcategory={handleDeleteSubcategory}
            />
          )}

          {adminTab === 'authors' && (
            <AuthorManager
              authors={authors}
              onAddAuthor={handleAddAuthor}
              onUpdateAuthor={handleUpdateAuthor}
              onDeleteAuthor={handleDeleteAuthor}
            />
          )}

          {adminTab === 'videos' && (
            <VideoManager
              videos={videos}
              onAddVideo={handleAddVideo}
              onDeleteVideo={handleDeleteVideo}
            />
          )}

          {adminTab === 'epaper' && (
            <EPaperManager
              editions={epaperEditions}
              onAddEdition={handleAddEPaper}
              onDeleteEdition={handleDeleteEPaper}
            />
          )}

          {adminTab === 'ads' && (
            <AdManager
              ads={ads}
              onAddAd={handleAddAd}
              onUpdateAd={handleUpdateAd}
              onDeleteAd={handleDeleteAd}
            />
          )}

          {adminTab === 'seo' && (
            <SeoSettingsManager
              seoSettings={seoSettings}
              articles={articles}
              categories={categories}
              onSaveSeo={handleSaveSeo}
            />
          )}

          {adminTab === 'settings' && (
            <SiteSettingsManager
              siteSettings={siteSettings}
              onSave={handleSaveSiteSettings}
            />
          )}

          {adminTab === 'users' && (
            <UserManager onRefreshData={refreshData} />
          )}

          {adminTab === 'activity' && (
            <ActivityLogViewer logs={activityLogs} />
          )}
        </AdminLayout>
      )}

      {/* 3. PUBLIC WEBSITE VIEWS */}
      {currentView !== 'admin_login' && currentView !== 'admin' && (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Main Website Header */}
          <Header
            currentPath={buildUrl({
              view: currentView,
              activeSlug,
              activeCategorySlug,
              activeAuthorSlug,
              searchQuery,
              staticPageType,
            })}
            onNavigate={handleNavigate}
            categories={categories}
            breakingNews={breakingNews}
            onSelectCategory={navigateToCategory}
            onSelectArticle={navigateToArticle}
            onSearch={navigateToSearch}
            onNavigateHome={navigateToHome}
            onNavigateEPaper={navigateToEPaper}
            onNavigateVideos={navigateToVideos}
            onNavigateAdmin={navigateToAdmin}
          />

          {/* Dynamic Page Routing */}
          <main className="flex-1">
            {currentView === 'home' && (
              <HomePage
                articles={articles}
                categories={categories}
                videos={videos}
                breakingNews={breakingNews}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
                onSelectVideo={navigateToVideos}
                onSelectDistrict={(dist) => navigateToCategory(`haryana?district=${encodeURIComponent(dist)}`)}
              />
            )}

            {currentView === 'article' && (
              <ArticlePage
                slug={activeSlug}
                articles={articles}
                categories={categories}
                siteSettings={siteSettings}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
                onSelectAuthor={navigateToAuthor}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'category' && (
              <CategoryPage
                categorySlug={activeCategorySlug}
                categories={categories}
                subcategories={subcategories}
                articles={articles}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'search' && (
              <SearchPage
                initialQuery={searchQuery}
                categories={categories}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
              />
            )}

            {currentView === 'author' && (
              <AuthorPage
                authorSlug={activeAuthorSlug}
                authors={authors}
                categories={categories}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
              />
            )}

            {currentView === 'videos' && (
              <VideosPage
                videos={videos}
                onSelectArticle={navigateToArticle}
              />
            )}

            {currentView === 'photos' && (
              <PhotosPage
                articles={articles}
                onSelectArticle={navigateToArticle}
              />
            )}

            {currentView === 'epaper' && (
              <EPaperPage
                onNavigateHome={navigateToHome}
              />
            )}

            {currentView === 'static' && (
              <StaticPage
                pageType={staticPageType}
                onNavigateHome={navigateToHome}
                onSelectPage={(page) => navigateToStatic(page as StaticPageType)}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'sitemap' && (
              <SitemapPage
                articles={articles}
                categories={categories}
                onSelectArticle={navigateToArticle}
                onSelectCategory={navigateToCategory}
              />
            )}
          </main>

          {/* Main Website Footer */}
          <Footer
            onNavigate={handleNavigate}
            categories={categories}
            siteSettings={siteSettings}
            onSelectCategory={navigateToCategory}
            onSelectStaticPage={navigateToStatic}
            onSelectSitemap={navigateToSitemap}
            onNavigateEPaper={navigateToEPaper}
            onNavigateVideos={navigateToVideos}
            onNavigateAdmin={navigateToAdmin}
          />
        </div>
      )}

      {/* Global Article Editor Modal */}
      <ArticleEditorModal
        article={editingArticle}
        categories={categories}
        subcategories={subcategories}
        authors={authors}
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onSave={handleSaveArticle}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
