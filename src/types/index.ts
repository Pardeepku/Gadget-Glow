export type UserRole = 'super_admin' | 'admin' | 'editor' | 'reporter' | 'moderator' | 'reader';

export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'pending_review';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  photo?: string;
  designation?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  featuredImage: string;
  imageCaption?: string;
  imageCredit?: string;
  imageAlt?: string;
  gallery?: string[];
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  district?: string;
  authorId: string;
  authorName: string;
  authorSlug?: string;
  authorPhoto?: string;
  authorRole?: string;
  tags: string[];
  location?: string;
  language?: 'hi' | 'en';
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending?: boolean;
  isEditorsPick?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  scheduledFor?: string;
  views: number;
  likes?: number;
  readingTime?: number | string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  socialImage?: string;
  videoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Subcategory {
  id: string;
  parentCategoryId: string;
  parentCategoryName?: string;
  name: string;
  nameHi: string;
  slug: string;
  order?: number;
  isActive: boolean;
}

export interface BreakingNews {
  id: string;
  title: string;
  slug?: string;
  url?: string;
  link?: string;
  priority: 'critical' | 'high' | 'medium' | 'normal' | 'low';
  isActive: boolean;
  createdAt?: string;
  expiresAt?: string;
}

export type AdPosition =
  | 'header'
  | 'homepage_top'
  | 'homepage_middle'
  | 'sidebar'
  | 'article_top'
  | 'article_middle'
  | 'article_bottom'
  | 'footer'
  | 'mobile_sticky';

export interface Advertisement {
  id: string;
  title: string;
  position: AdPosition;
  type: 'image' | 'script' | 'adsense' | 'code';
  imageUrl?: string;
  targetUrl?: string;
  htmlCode?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
  createdAt?: string;
}

export interface Author {
  id: string;
  name: string;
  slug?: string;
  email?: string;
  role?: UserRole;
  photoURL?: string;
  photo?: string;
  bio?: string;
  designation?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  isActive: boolean;
  articleCount?: number;
}

export interface VideoNews {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  authorName?: string;
  publishedAt?: string;
  views?: number;
  duration?: string;
  isFeatured?: boolean;
}

export interface EPaperEdition {
  id: string;
  editionName: string;
  date: string;
  thumbnailUrl: string;
  totalPages: number;
  pdfUrl?: string;
  pages?: string[];
  createdAt?: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId?: string;
  googleSearchConsoleVerification?: string;
  googleNewsPublisherId?: string;
  robotsTxt?: string;
  canonicalUrl?: string;
  canonicalDomain?: string;
  ogImage?: string;
  twitterHandle?: string;
  schemaOrgJson?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  path?: string;
  mimeType: string;
  size: number;
  altText?: string;
  caption?: string;
  credit?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  articleTitle: string;
  userName: string;
  userEmail: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SiteSettings {
  websiteName: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  phone: string;
  address: string;
  copyrightText?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  defaultSeoTitle?: string;
  defaultSeoDesc?: string;
  defaultSeoImage?: string;
  breakingNewsSpeed?: number;
  commentsEnabled?: boolean;
  maintenanceMode?: boolean;
  language?: 'hi' | 'en';
}

export interface HomepageSection {
  id: string;
  title: string;
  titleHi: string;
  type: 'hero' | 'category_grid' | 'haryana_district' | 'state_tabs' | 'trending' | 'videos' | 'photos' | 'politics_crime' | 'business_sports' | 'newsletter';
  categoryId?: string;
  limit: number;
  order: number;
  isEnabled: boolean;
  layoutStyle?: 'grid' | 'slider' | 'list' | 'bento';
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read' | 'replied';
  isRead?: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type StaticPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'editorial-policy';
