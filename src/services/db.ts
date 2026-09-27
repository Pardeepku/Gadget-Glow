import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, isLive } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Article,
  Category,
  Subcategory,
  BreakingNews,
  Advertisement,
  Author,
  VideoNews,
  EPaperEdition,
  SeoSettings,
  SiteSettings,
  HomepageSection,
  NewsletterSubscriber,
  ContactMessage,
  ActivityLog,
  Comment,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_AUTHORS,
  INITIAL_BREAKING_NEWS,
  INITIAL_ARTICLES,
  INITIAL_VIDEOS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_SITE_SETTINGS,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_EPAPER_EDITIONS,
  INITIAL_SEO_SETTINGS,
} from '../data/initialData';
import { DEMO_ACCOUNTS, toUserProfile } from '../data/demoAccounts';

export const INITIAL_EPAPER = INITIAL_EPAPER_EDITIONS;
export { INITIAL_SEO_SETTINGS };

// Cached settings for sync fallback render
let cachedSiteSettings: SiteSettings = INITIAL_SITE_SETTINGS;
let cachedSeoSettings: SeoSettings = INITIAL_SEO_SETTINGS;

const LOCAL_CUSTOM_ARTICLES_KEY = 'sf_portal_custom_articles_v1';

export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as any;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = stripUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

export function getLocalCustomArticles(): Article[] {
  try {
    const stored = localStorage.getItem(LOCAL_CUSTOM_ARTICLES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomArticles(articles: Article[]): void {
  try {
    localStorage.setItem(LOCAL_CUSTOM_ARTICLES_KEY, JSON.stringify(articles));
  } catch (err) {
    console.warn('Could not persist full articles to localStorage, compressing payloads:', err);
    try {
      const lightweight = articles.map((a) => {
        if (a.featuredImage && a.featuredImage.startsWith('data:image')) {
          return {
            ...a,
            featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
          };
        }
        return a;
      });
      localStorage.setItem(LOCAL_CUSTOM_ARTICLES_KEY, JSON.stringify(lightweight));
    } catch {
      // Non-critical local storage fallback
    }
  }
}

function filterLocalArticles(source: Article[], filter?: {
  categoryId?: string;
  subcategoryId?: string;
  status?: string;
  authorId?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorsPick?: boolean;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}): Article[] {
  let items = [...source];
  if (filter?.status) {
    items = items.filter((a) => a.status === filter.status);
  }
  if (filter?.categoryId) {
    items = items.filter((a) => a.categoryId === filter.categoryId);
  }
  if (filter?.subcategoryId) {
    items = items.filter((a) => a.subcategoryId === filter.subcategoryId);
  }
  if (filter?.authorId) {
    items = items.filter((a) => a.authorId === filter.authorId);
  }
  if (filter?.isBreaking !== undefined) {
    items = items.filter((a) => a.isBreaking === filter.isBreaking);
  }
  if (filter?.isFeatured !== undefined) {
    items = items.filter((a) => a.isFeatured === filter.isFeatured);
  }
  if (filter?.isTrending !== undefined) {
    items = items.filter((a) => a.isTrending === filter.isTrending);
  }
  if (filter?.searchQuery?.trim()) {
    const q = filter.searchQuery.trim().toLowerCase();
    items = items.filter(
      (art) =>
        art.title?.toLowerCase().includes(q) ||
        art.shortDescription?.toLowerCase().includes(q) ||
        art.content?.toLowerCase().includes(q) ||
        art.tags?.some((t) => t.toLowerCase().includes(q)) ||
        art.categoryName?.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => {
    const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  if (filter?.limit) {
    items = items.slice(0, filter.limit);
  }

  return items;
}

export const dbService = {
  // ---------------- ARTICLES ----------------
  async getArticles(filter?: {
    categoryId?: string;
    subcategoryId?: string;
    status?: string;
    authorId?: string;
    isBreaking?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    isEditorsPick?: boolean;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<Article[]> {
    const articleMap = new Map<string, Article>();

    // 1. Initial articles
    INITIAL_ARTICLES.forEach((art) => articleMap.set(art.id, art));

    // 2. Locally cached custom/uploaded articles
    getLocalCustomArticles().forEach((art) => articleMap.set(art.id, art));

    // 3. Firestore live articles
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'articles'));
        snap.forEach((d) => {
          articleMap.set(d.id, { id: d.id, ...(d.data() as Omit<Article, 'id'>) });
        });
      } catch (error) {
        console.warn('Firestore fetch articles error, falling back gracefully:', error);
      }
    }

    const allArticles = Array.from(articleMap.values());
    return filterLocalArticles(allArticles, filter);
  },

  async getArticleById(id: string): Promise<Article | null> {
    if (!id) return null;

    // Check local custom articles first
    const local = getLocalCustomArticles().find((a) => a.id === id);
    if (local) return local;

    if (db) {
      try {
        const snap = await getDoc(doc(db, 'articles', id));
        if (snap.exists()) {
          return { id: snap.id, ...(snap.data() as Omit<Article, 'id'>) };
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `articles/${id}`);
      }
    }
    return INITIAL_ARTICLES.find((a) => a.id === id) || null;
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    if (!slug) return null;
    const cleanSlug = typeof slug === 'string'
      ? decodeURIComponent(slug).replace(/^\/?(news\/)?/, '').replace(/\/$/, '').trim()
      : String(slug);

    // Check local custom articles first
    const local = getLocalCustomArticles().find((a) => a.slug === cleanSlug || a.id === cleanSlug);
    if (local) return local;

    if (db) {
      try {
        const q = query(collection(db, 'articles'), where('slug', '==', cleanSlug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { id: docSnap.id, ...(docSnap.data() as Omit<Article, 'id'>) };
        }
        // Also try fetching directly by ID in case slug is an ID
        const directSnap = await getDoc(doc(db, 'articles', cleanSlug));
        if (directSnap.exists()) {
          return { id: directSnap.id, ...(directSnap.data() as Omit<Article, 'id'>) };
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `articles/slug/${cleanSlug}`);
      }
    }
    return INITIAL_ARTICLES.find((a) => a.slug === cleanSlug || a.id === cleanSlug) || null;
  },

  async createArticle(
    article: Omit<Article, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>,
    authorName?: string
  ): Promise<Article> {
    const id = (article as any).id || `art-${Date.now()}`;
    const newArticle: Article = {
      ...article,
      id,
      views: (article as any).views || 0,
      likes: (article as any).likes || 0,
      createdAt: (article as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: article.status === 'published' ? ((article as any).publishedAt || new Date().toISOString()) : undefined,
    };

    const cleanData = stripUndefined(newArticle);

    // 1. Save to local storage cache immediately so UI reflects it immediately
    const customList = getLocalCustomArticles();
    const existingIndex = customList.findIndex((a) => a.id === id);
    if (existingIndex >= 0) {
      customList[existingIndex] = cleanData;
    } else {
      customList.unshift(cleanData);
    }
    saveLocalCustomArticles(customList);

    // 2. Persist to Firestore with background/fast timeout so network latency never hangs the publish flow
    if (db) {
      const firestoreWritePromise = setDoc(doc(db, 'articles', id), cleanData)
        .then(() => {
          this.logActivity({
            userId: 'admin-action',
            userName: authorName || article.authorName || 'संपादक',
            action: 'Article Created',
            entityType: 'Article',
            entityId: id,
            details: `नया समाचार बनाया गया: "${cleanData.title}"`,
            timestamp: new Date().toISOString(),
          }).catch(console.warn);
        })
        .catch((error) => {
          console.warn('Firestore write failed, but saved to local cache:', error);
        });

      // Wait up to 1000ms for network ack, otherwise continue in background
      try {
        await Promise.race([
          firestoreWritePromise,
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
      } catch {
        // Continue
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samachar_store_updated', { detail: cleanData }));
    }

    return cleanData;
  },

  async updateArticle(id: string, articleUpdate: Partial<Article>, adminName?: string): Promise<void> {
    if (!id) throw new Error('Article ID is required for update');

    const updateData = stripUndefined({
      ...articleUpdate,
      updatedAt: new Date().toISOString(),
      ...(articleUpdate.status === 'published' && !articleUpdate.publishedAt
        ? { publishedAt: new Date().toISOString() }
        : {}),
    });

    // 1. Update local custom articles cache
    const customList = getLocalCustomArticles();
    const idx = customList.findIndex((a) => a.id === id);
    if (idx >= 0) {
      customList[idx] = { ...customList[idx], ...updateData };
      saveLocalCustomArticles(customList);
    } else {
      // If updating an initial article, make a custom copy
      const base = INITIAL_ARTICLES.find((a) => a.id === id);
      if (base) {
        customList.unshift({ ...base, ...updateData });
        saveLocalCustomArticles(customList);
      }
    }

    // 2. Update Firestore (use setDoc with merge: true for resilient upsert)
    if (db) {
      try {
        await setDoc(doc(db, 'articles', id), updateData, { merge: true });
        this.logActivity({
          userId: 'admin-action',
          userName: adminName || 'संपादक',
          action: 'Article Updated',
          entityType: 'Article',
          entityId: id,
          details: `समाचार अपडेट किया गया: ${id}`,
          timestamp: new Date().toISOString(),
        }).catch(console.warn);
      } catch (error) {
        console.warn('Firestore article upsert error, saved locally:', error);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samachar_store_updated'));
    }
  },

  async deleteArticle(id: string, adminName?: string): Promise<void> {
    if (!id) throw new Error('Article ID is required for deletion');

    // 1. Remove from local custom articles
    const customList = getLocalCustomArticles().filter((a) => a.id !== id);
    saveLocalCustomArticles(customList);

    // 2. Delete from Firestore
    if (db) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        this.logActivity({
          userId: 'admin-action',
          userName: adminName || 'संपादक',
          action: 'Article Deleted',
          entityType: 'Article',
          entityId: id,
          details: `समाचार हटाया गया: ${id}`,
          timestamp: new Date().toISOString(),
        }).catch(console.warn);
      } catch (error) {
        console.warn('Firestore deleteDoc failed, deleted locally:', error);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samachar_store_updated'));
    }
  },

  async incrementArticleViews(id: string): Promise<void> {
    if (!db || !id) return;
    try {
      await updateDoc(doc(db, 'articles', id), {
        views: increment(1),
      });
    } catch {
      // Non-critical background metric update
    }
  },

  async toggleLikeArticle(id: string): Promise<number> {
    if (!db || !id) return 0;
    try {
      const artRef = doc(db, 'articles', id);
      await updateDoc(artRef, {
        likes: increment(1),
      });
      const snap = await getDoc(artRef);
      return snap.exists() ? snap.data().likes || 1 : 1;
    } catch {
      return 1;
    }
  },

  // ---------------- CATEGORIES ----------------
  async getCategories(): Promise<Category[]> {
    if (!db) return INITIAL_CATEGORIES;
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const items: Category[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
      });
      if (items.length === 0) {
        this.seedInitialDataToFirestore().catch(console.warn);
        return INITIAL_CATEGORIES;
      }
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'categories');
      return INITIAL_CATEGORIES;
    }
  },

  async addCategory(category: Omit<Category, 'id'>, adminName?: string): Promise<Category> {
    if (!db) throw new Error('Firestore is not connected');

    const id = `cat-${category.slug || Date.now()}`;
    const newCat: Category = { ...category, id };

    try {
      await setDoc(doc(db, 'categories', id), newCat);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Category Created',
        entityType: 'Category',
        entityId: id,
        details: `नई श्रेणी बनाई गई: "${newCat.nameHi}" (${newCat.name})`,
        timestamp: new Date().toISOString(),
      });
      return newCat;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `categories/${id}`);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<Category>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'categories', id), category, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Category Updated',
        entityType: 'Category',
        entityId: id,
        details: `श्रेणी अपडेट की गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
      throw error;
    }
  },

  async deleteCategory(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'categories', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Category Deleted',
        entityType: 'Category',
        entityId: id,
        details: `श्रेणी हटाई गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      throw error;
    }
  },

  // ---------------- SUBCATEGORIES ----------------
  async getSubcategories(parentCategoryId?: string): Promise<Subcategory[]> {
    if (!db) {
      if (parentCategoryId) {
        return INITIAL_SUBCATEGORIES.filter((s) => s.parentCategoryId === parentCategoryId);
      }
      return INITIAL_SUBCATEGORIES;
    }
    try {
      let q = collection(db, 'subcategories');
      const snap = await getDocs(q);
      let items: Subcategory[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Subcategory, 'id'>) });
      });
      if (items.length === 0) {
        if (parentCategoryId) {
          return INITIAL_SUBCATEGORIES.filter((s) => s.parentCategoryId === parentCategoryId);
        }
        return INITIAL_SUBCATEGORIES;
      }
      if (parentCategoryId) {
        items = items.filter((s) => s.parentCategoryId === parentCategoryId);
      }
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'subcategories');
      if (parentCategoryId) {
        return INITIAL_SUBCATEGORIES.filter((s) => s.parentCategoryId === parentCategoryId);
      }
      return INITIAL_SUBCATEGORIES;
    }
  },

  async addSubcategory(sub: Omit<Subcategory, 'id'>, adminName?: string): Promise<Subcategory> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `sub-${sub.slug || Date.now()}`;
    const newSub: Subcategory = { ...sub, id };

    try {
      await setDoc(doc(db, 'subcategories', id), newSub);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Subcategory Created',
        entityType: 'Subcategory',
        entityId: id,
        details: `उप-श्रेणी/जिला जोड़ा गया: "${newSub.nameHi}"`,
        timestamp: new Date().toISOString(),
      });
      return newSub;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `subcategories/${id}`);
      throw error;
    }
  },

  async updateSubcategory(id: string, sub: Partial<Subcategory>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'subcategories', id), sub, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Subcategory Updated',
        entityType: 'Subcategory',
        entityId: id,
        details: `उप-श्रेणी अपडेट की गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subcategories/${id}`);
      throw error;
    }
  },

  async deleteSubcategory(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'subcategories', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Subcategory Deleted',
        entityType: 'Subcategory',
        entityId: id,
        details: `उप-श्रेणी हटाई गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subcategories/${id}`);
      throw error;
    }
  },

  // ---------------- BREAKING NEWS ----------------
  async getBreakingNews(): Promise<BreakingNews[]> {
    if (!db) return INITIAL_BREAKING_NEWS;
    try {
      const snap = await getDocs(collection(db, 'breakingNews'));
      const items: BreakingNews[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<BreakingNews, 'id'>) });
      });
      if (items.length === 0) {
        return INITIAL_BREAKING_NEWS;
      }
      return items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'breakingNews');
      return INITIAL_BREAKING_NEWS;
    }
  },

  async getActiveBreakingNews(): Promise<BreakingNews[]> {
    const list = await this.getBreakingNews();
    return list.filter((b) => b.isActive);
  },

  async addBreakingNews(item: Omit<BreakingNews, 'id' | 'createdAt'>, adminName?: string): Promise<BreakingNews> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `brk-${Date.now()}`;
    const newItem: BreakingNews = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'breakingNews', id), newItem);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Breaking News Added',
        entityType: 'BreakingNews',
        entityId: id,
        details: `ब्रेकिंग न्यूज़ जोड़ी गई: "${newItem.title}"`,
        timestamp: new Date().toISOString(),
      });
      return newItem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `breakingNews/${id}`);
      throw error;
    }
  },

  async updateBreakingNews(id: string, item: Partial<BreakingNews>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'breakingNews', id), item, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Breaking News Updated',
        entityType: 'BreakingNews',
        entityId: id,
        details: `ब्रेकिंग न्यूज़ अपडेट की गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `breakingNews/${id}`);
      throw error;
    }
  },

  async deleteBreakingNews(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'breakingNews', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Breaking News Deleted',
        entityType: 'BreakingNews',
        entityId: id,
        details: `ब्रेकिंग न्यूज़ हटाई गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `breakingNews/${id}`);
      throw error;
    }
  },

  // ---------------- AUTHORS / REPORTERS ----------------
  async getAuthors(): Promise<Author[]> {
    if (!db) return INITIAL_AUTHORS;
    try {
      const snap = await getDocs(collection(db, 'authors'));
      const items: Author[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Author, 'id'>) });
      });
      if (items.length === 0) return INITIAL_AUTHORS;
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'authors');
      return INITIAL_AUTHORS;
    }
  },

  async getAuthorById(id: string): Promise<Author | null> {
    if (!id) return null;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'authors', id));
        if (snap.exists()) {
          return { id: snap.id, ...(snap.data() as Omit<Author, 'id'>) };
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `authors/${id}`);
      }
    }
    return INITIAL_AUTHORS.find((a) => a.id === id) || null;
  },

  async addAuthor(author: Omit<Author, 'id'>, adminName?: string): Promise<Author> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `auth-${Date.now()}`;
    const newAuthor: Author = { ...author, id };

    try {
      await setDoc(doc(db, 'authors', id), newAuthor);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Author Profile Created',
        entityType: 'Author',
        entityId: id,
        details: `पत्रकार/संपादक प्रोफाइल बनाई गई: "${newAuthor.name}"`,
        timestamp: new Date().toISOString(),
      });
      return newAuthor;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `authors/${id}`);
      throw error;
    }
  },

  async updateAuthor(id: string, author: Partial<Author>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'authors', id), author, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Author Updated',
        entityType: 'Author',
        entityId: id,
        details: `पत्रकार प्रोफाइल अपडेट की गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `authors/${id}`);
      throw error;
    }
  },

  async deleteAuthor(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'authors', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Author Deleted',
        entityType: 'Author',
        entityId: id,
        details: `पत्रकार प्रोफाइल हटाई गई: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `authors/${id}`);
      throw error;
    }
  },

  // ---------------- VIDEOS ----------------
  async getVideos(): Promise<VideoNews[]> {
    if (!db) return INITIAL_VIDEOS;
    try {
      const snap = await getDocs(collection(db, 'videos'));
      const items: VideoNews[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<VideoNews, 'id'>) });
      });
      if (items.length === 0) return INITIAL_VIDEOS;
      return items.sort((a, b) => {
        const timeA = new Date(a.publishedAt || 0).getTime();
        const timeB = new Date(b.publishedAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'videos');
      return INITIAL_VIDEOS;
    }
  },

  async addVideo(vid: Omit<VideoNews, 'id'> | Omit<VideoNews, 'id' | 'views'>, adminName?: string): Promise<VideoNews> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `vid-${Date.now()}`;
    const newVid: VideoNews = {
      views: 0,
      ...vid,
      id,
    };

    try {
      await setDoc(doc(db, 'videos', id), newVid);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Video News Added',
        entityType: 'Video',
        entityId: id,
        details: `वीडियो समाचार जोड़ा गया: "${newVid.title}"`,
        timestamp: new Date().toISOString(),
      });
      return newVid;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `videos/${id}`);
      throw error;
    }
  },

  async updateVideo(id: string, vid: Partial<VideoNews>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'videos', id), vid, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Video Updated',
        entityType: 'Video',
        entityId: id,
        details: `वीडियो अपडेट किया गया: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${id}`);
      throw error;
    }
  },

  async deleteVideo(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'videos', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Video Deleted',
        entityType: 'Video',
        entityId: id,
        details: `वीडियो हटाया गया: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `videos/${id}`);
      throw error;
    }
  },

  // ---------------- ADVERTISEMENTS ----------------
  async getAds(position?: string): Promise<Advertisement[]> {
    if (!db) {
      if (position) return INITIAL_ADVERTISEMENTS.filter((a) => a.position === position && a.isActive);
      return INITIAL_ADVERTISEMENTS;
    }
    try {
      const snap = await getDocs(collection(db, 'advertisements'));
      let items: Advertisement[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Advertisement, 'id'>) });
      });
      if (items.length === 0) {
        items = INITIAL_ADVERTISEMENTS;
      }
      if (position) {
        items = items.filter((a) => a.position === position && a.isActive);
      }
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'advertisements');
      if (position) return INITIAL_ADVERTISEMENTS.filter((a) => a.position === position && a.isActive);
      return INITIAL_ADVERTISEMENTS;
    }
  },

  async getAdvertisements(position?: string): Promise<Advertisement[]> {
    return this.getAds(position);
  },

  async addAd(ad: Omit<Advertisement, 'id'>, adminName?: string): Promise<Advertisement> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `ad-${Date.now()}`;
    const newAd: Advertisement = { ...ad, id };

    try {
      await setDoc(doc(db, 'advertisements', id), newAd);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Ad Created',
        entityType: 'Advertisement',
        entityId: id,
        details: `विज्ञापन स्लॉट जोड़ा गया: "${newAd.title}" (${newAd.position})`,
        timestamp: new Date().toISOString(),
      });
      return newAd;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `advertisements/${id}`);
      throw error;
    }
  },

  async updateAd(id: string, ad: Partial<Advertisement>, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'advertisements', id), ad, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Ad Updated',
        entityType: 'Advertisement',
        entityId: id,
        details: `विज्ञापन अपडेट किया गया: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `advertisements/${id}`);
      throw error;
    }
  },

  async deleteAd(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'advertisements', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'Ad Deleted',
        entityType: 'Advertisement',
        entityId: id,
        details: `विज्ञापन हटाया गया: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `advertisements/${id}`);
      throw error;
    }
  },

  // ---------------- E-PAPER ----------------
  async getEPaperEditions(): Promise<EPaperEdition[]> {
    if (!db) return INITIAL_EPAPER_EDITIONS;
    try {
      const snap = await getDocs(collection(db, 'epaper'));
      const items: EPaperEdition[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<EPaperEdition, 'id'>) });
      });
      if (items.length === 0) return INITIAL_EPAPER_EDITIONS;
      return items.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'epaper');
      return INITIAL_EPAPER_EDITIONS;
    }
  },

  async getEPapers(): Promise<EPaperEdition[]> {
    return this.getEPaperEditions();
  },

  async getEPaperById(id: string): Promise<EPaperEdition | null> {
    if (!id) return null;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'epaper', id));
        if (snap.exists()) {
          return { id: snap.id, ...(snap.data() as Omit<EPaperEdition, 'id'>) };
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `epaper/${id}`);
      }
    }
    return INITIAL_EPAPER_EDITIONS.find((ep) => ep.id === id) || null;
  },

  async addEPaperEdition(edition: Omit<EPaperEdition, 'id' | 'createdAt'>, adminName?: string): Promise<EPaperEdition> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `ep-${Date.now()}`;
    const newEdition: EPaperEdition = {
      ...edition,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'epaper', id), newEdition);
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'E-Paper Uploaded',
        entityType: 'EPaper',
        entityId: id,
        details: `ई-पेपर संस्करण प्रकाशित: "${newEdition.editionName}" (${newEdition.date})`,
        timestamp: new Date().toISOString(),
      });
      return newEdition;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `epaper/${id}`);
      throw error;
    }
  },

  async addEPaper(edition: Omit<EPaperEdition, 'id' | 'createdAt'>, adminName?: string): Promise<EPaperEdition> {
    return this.addEPaperEdition(edition, adminName);
  },

  async deleteEPaperEdition(id: string, adminName?: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'epaper', id));
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'संपादक',
        action: 'E-Paper Deleted',
        entityType: 'EPaper',
        entityId: id,
        details: `ई-पेपर हटाया गया: ${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `epaper/${id}`);
      throw error;
    }
  },

  // ---------------- SITE SETTINGS ----------------
  getSiteSettings(): SiteSettings {
    // Provide fast synchronous return of current cached memory state
    if (db) {
      getDoc(doc(db, 'siteSettings', 'main'))
        .then((snap) => {
          if (snap.exists()) {
            cachedSiteSettings = snap.data() as SiteSettings;
          }
        })
        .catch(() => {});
    }
    return cachedSiteSettings;
  },

  async fetchSiteSettings(): Promise<SiteSettings> {
    if (!db) return cachedSiteSettings;
    try {
      const snap = await getDoc(doc(db, 'siteSettings', 'main'));
      if (snap.exists()) {
        cachedSiteSettings = snap.data() as SiteSettings;
        return cachedSiteSettings;
      }
      return cachedSiteSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'siteSettings/main');
      return cachedSiteSettings;
    }
  },

  async updateSiteSettings(settings: Partial<SiteSettings>, adminName?: string): Promise<void> {
    if (!db) throw new Error('Firestore is not connected');
    try {
      const updated = { ...cachedSiteSettings, ...settings };
      cachedSiteSettings = updated as SiteSettings;
      await setDoc(doc(db, 'siteSettings', 'main'), updated, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'सुपर एडमिन',
        action: 'Site Settings Updated',
        entityType: 'Settings',
        entityId: 'siteSettings',
        details: 'वेबसाइट की मूल सेटिंग्स अपडेट की गईं',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'siteSettings/main');
      throw error;
    }
  },

  // ---------------- SEO SETTINGS ----------------
  getSeoSettings(): SeoSettings {
    if (db) {
      getDoc(doc(db, 'seoSettings', 'main'))
        .then((snap) => {
          if (snap.exists()) {
            cachedSeoSettings = snap.data() as SeoSettings;
          }
        })
        .catch(() => {});
    }
    return cachedSeoSettings;
  },

  async fetchSeoSettings(): Promise<SeoSettings> {
    if (!db) return cachedSeoSettings;
    try {
      const snap = await getDoc(doc(db, 'seoSettings', 'main'));
      if (snap.exists()) {
        cachedSeoSettings = snap.data() as SeoSettings;
        return cachedSeoSettings;
      }
      return cachedSeoSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'seoSettings/main');
      return cachedSeoSettings;
    }
  },

  async updateSeoSettings(settings: Partial<SeoSettings>, adminName?: string): Promise<void> {
    if (!db) throw new Error('Firestore is not connected');
    try {
      const updated = { ...cachedSeoSettings, ...settings };
      cachedSeoSettings = updated as SeoSettings;
      await setDoc(doc(db, 'seoSettings', 'main'), updated, { merge: true });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'सुपर एडमिन',
        action: 'SEO Settings Updated',
        entityType: 'Settings',
        entityId: 'seoSettings',
        details: 'मेटा टैग्स और SEO सेटिंग्स अपडेट की गईं',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'seoSettings/main');
      throw error;
    }
  },

  // ---------------- HOMEPAGE SECTIONS ----------------
  async getHomepageSections(): Promise<HomepageSection[]> {
    if (!db) return [];
    try {
      const snap = await getDoc(doc(db, 'homepageSections', 'main'));
      if (snap.exists() && snap.data().sections) {
        return snap.data().sections as HomepageSection[];
      }
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'homepageSections/main');
      return [];
    }
  },

  async updateHomepageSections(sections: HomepageSection[], adminName?: string): Promise<void> {
    if (!db) throw new Error('Firestore is not connected');
    try {
      await setDoc(doc(db, 'homepageSections', 'main'), { sections });
      this.logActivity({
        userId: 'admin-action',
        userName: adminName || 'सुपर एडमिन',
        action: 'Homepage Layout Updated',
        entityType: 'Settings',
        entityId: 'homepageSections',
        details: 'होमपेज सेक्शन लेआउट अपडेट किया गया',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'homepageSections/main');
      throw error;
    }
  },

  // ---------------- COMMENTS ----------------
  async getComments(articleId?: string): Promise<Comment[]> {
    if (!db) return [];
    try {
      let q = collection(db, 'comments');
      const snap = await getDocs(q);
      let items: Comment[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<Comment, 'id'>) });
      });
      if (articleId) {
        items = items.filter((c) => c.articleId === articleId && c.status === 'approved');
      }
      return items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'comments');
      return [];
    }
  },

  async addComment(comment: Omit<Comment, 'id' | 'createdAt' | 'status'>): Promise<Comment> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `comm-${Date.now()}`;
    const newComment: Comment = {
      ...comment,
      id,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'comments', id), newComment);
      return newComment;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `comments/${id}`);
      throw error;
    }
  },

  async approveComment(id: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await updateDoc(doc(db, 'comments', id), { status: 'approved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${id}`);
      throw error;
    }
  },

  async deleteComment(id: string): Promise<void> {
    if (!db || !id) throw new Error('Firestore is not connected');
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${id}`);
      throw error;
    }
  },

  // ---------------- CONTACT MESSAGES ----------------
  async sendContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    if (!db) throw new Error('Firestore is not connected');
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'contactMessages', id), newMsg);
      this.logActivity({
        userId: 'public-user',
        userName: msg.name,
        action: 'Contact Message Received',
        entityType: 'Contact',
        entityId: id,
        details: `संपर्क संदेश: "${msg.subject || 'सामान्य'}" from ${msg.email}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contactMessages/${id}`);
      throw error;
    }
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'contactMessages'));
      const items: ContactMessage[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) });
      });
      return items.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'contactMessages');
      return [];
    }
  },

  async markContactMessageRead(id: string): Promise<void> {
    if (!db || !id) return;
    try {
      await updateDoc(doc(db, 'contactMessages', id), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contactMessages/${id}`);
    }
  },

  async deleteContactMessage(id: string): Promise<void> {
    if (!db || !id) return;
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contactMessages/${id}`);
    }
  },

  // ---------------- NEWSLETTER SUBSCRIBERS ----------------
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'कृपया एक वैध ईमेल पता दर्ज करें।' };
    }
    if (!db) {
      return { success: true, message: 'गैजेट ग्लो बुलेटिन की सदस्यता के लिए धन्यवाद!' };
    }

    try {
      const safeId = `sub-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const subscriber: NewsletterSubscriber = {
        id: safeId,
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString(),
        isActive: true,
      };

      await setDoc(doc(db, 'newsletterSubscribers', safeId), subscriber, { merge: true });
      return { success: true, message: 'गैजेट ग्लो बुलेटिन की सदस्यता के लिए धन्यवाद!' };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'newsletterSubscribers');
      return { success: false, message: 'सदस्यता जोड़ने में समस्या आई। कृपया पुनः प्रयास करें।' };
    }
  },

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'newsletterSubscribers'));
      const items: NewsletterSubscriber[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<NewsletterSubscriber, 'id'>) });
      });
      return items;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'newsletterSubscribers');
      return [];
    }
  },

  // ---------------- ACTIVITY LOGS ----------------
  async logActivity(log: Omit<ActivityLog, 'id'>): Promise<void> {
    if (!db) return;
    const id = `act-${Date.now()}`;
    const newLog: ActivityLog = { ...log, id };

    try {
      await setDoc(doc(db, 'activityLogs', id), newLog);
    } catch {
      // Non-critical background telemetry
    }
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'activityLogs'));
      const items: ActivityLog[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) });
      });
      return items.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      }).slice(0, 100);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'activityLogs');
      return [];
    }
  },

  // ---------------- SEED / MIGRATION BOOTSTRAP ----------------
  /**
   * Idempotent seed function to populate Firestore collections with default data
   * only if documents do not already exist. Preserves stable document IDs.
   */
  async seedInitialDataToFirestore(): Promise<{ success: boolean; message: string }> {
    if (!db) {
      return { success: false, message: 'Firestore is not connected' };
    }

    if ((window as any).__sf_seeding_in_progress) {
      return { success: true, message: 'डेटाबेस सीडिंग पहले से प्रगति पर है...' };
    }
    (window as any).__sf_seeding_in_progress = true;

    try {
      const batch = writeBatch(db);

      // Categories
      for (const cat of INITIAL_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), cat, { merge: true });
      }

      // Subcategories
      for (const sub of INITIAL_SUBCATEGORIES) {
        batch.set(doc(db, 'subcategories', sub.id), sub, { merge: true });
      }

      // Authors
      for (const authItem of INITIAL_AUTHORS) {
        batch.set(doc(db, 'authors', authItem.id), authItem, { merge: true });
      }

      // Breaking News
      for (const brk of INITIAL_BREAKING_NEWS) {
        batch.set(doc(db, 'breakingNews', brk.id), brk, { merge: true });
      }

      // Articles
      for (const art of INITIAL_ARTICLES) {
        batch.set(doc(db, 'articles', art.id), art, { merge: true });
      }

      // Videos
      for (const vid of INITIAL_VIDEOS) {
        batch.set(doc(db, 'videos', vid.id), vid, { merge: true });
      }

      // Advertisements
      for (const ad of INITIAL_ADVERTISEMENTS) {
        batch.set(doc(db, 'advertisements', ad.id), ad, { merge: true });
      }

      // E-Paper
      for (const ep of INITIAL_EPAPER) {
        batch.set(doc(db, 'epaper', ep.id), ep, { merge: true });
      }

      // Site Settings
      batch.set(doc(db, 'siteSettings', 'main'), INITIAL_SITE_SETTINGS, { merge: true });

      // SEO Settings
      batch.set(doc(db, 'seoSettings', 'main'), INITIAL_SEO_SETTINGS, { merge: true });

      // Homepage Sections
      batch.set(doc(db, 'homepageSections', 'main'), { sections: INITIAL_HOMEPAGE_SECTIONS }, { merge: true });

      // Demo User Accounts and Roles
      for (const acc of DEMO_ACCOUNTS) {
        const profile = toUserProfile(acc);
        batch.set(doc(db, 'users', acc.id), profile, { merge: true });
      }

      await batch.commit();
      return { success: true, message: 'All initial news collections successfully seeded to Firestore.' };
    } catch (err: any) {
      console.warn('Error seeding Firestore (falling back gracefully):', err?.message || err);
      return { success: false, message: err?.message || 'Seeding failed' };
    } finally {
      (window as any).__sf_seeding_in_progress = false;
    }
  },
};
