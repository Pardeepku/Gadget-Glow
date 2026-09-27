import { Article, VideoNews, SiteSettings } from '../types';

export function updateMetaTags({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}) {
  document.title = title;

  const setMeta = (name: string, content?: string, attr: 'name' | 'property' = 'name') => {
    if (!content) return;
    let elem = document.querySelector(`meta[${attr}="${name}"]`);
    if (!elem) {
      elem = document.createElement('meta');
      elem.setAttribute(attr, name);
      document.head.appendChild(elem);
    }
    elem.setAttribute('content', content);
  };

  setMeta('description', description);
  if (keywords?.length) setMeta('keywords', keywords.join(', '));
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:type', type, 'property');
  if (url) setMeta('og:url', url, 'property');
  if (image) {
    setMeta('og:image', image, 'property');
    setMeta('twitter:image', image);
  }
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);

  if (publishedTime) setMeta('article:published_time', publishedTime, 'property');
  if (modifiedTime) setMeta('article:modified_time', modifiedTime, 'property');
  if (author) setMeta('article:author', author, 'property');
  if (section) setMeta('article:section', section, 'property');

  // Set canonical link
  if (url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }
}

export function generateNewsArticleSchema(article: Article, siteSettings: SiteSettings, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/news/${article.slug}`,
    },
    headline: article.title,
    description: article.shortDescription || article.title,
    image: [
      article.featuredImage,
      ...(article.gallery || []),
    ].filter(Boolean),
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      jobTitle: article.authorRole || 'Journalist',
      url: `${siteUrl}/author/${article.authorId}`,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteSettings.websiteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    articleSection: article.categoryName,
    keywords: article.tags?.join(', ') || article.categoryName,
    inLanguage: article.language === 'hi' ? 'hi-IN' : 'en-US',
  };
}

export function generateVideoSchema(video: VideoNews, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description || video.title,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
    contentUrl: video.youtubeUrl,
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema(siteSettings: SiteSettings, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteSettings.websiteName,
    alternateName: 'Gadget Glow',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: Object.values(siteSettings.socialLinks).filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteSettings.phone,
      contactType: 'editorial',
      email: siteSettings.contactEmail,
      areaServed: 'IN',
      availableLanguage: ['Hindi', 'English'],
    },
  };
}

export function generateXmlSitemap(articles: Article[], categories: { slug: string }[], siteUrl: string): string {
  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [
    { loc: `${siteUrl}/`, changefreq: 'always', priority: '1.0' },
    { loc: `${siteUrl}/latest-news`, changefreq: 'always', priority: '0.9' },
    { loc: `${siteUrl}/breaking-news`, changefreq: 'always', priority: '0.9' },
    { loc: `${siteUrl}/videos`, changefreq: 'hourly', priority: '0.8' },
    { loc: `${siteUrl}/photos`, changefreq: 'daily', priority: '0.8' },
    { loc: `${siteUrl}/sitemap`, changefreq: 'daily', priority: '0.7' },
    ...categories.map((c) => ({
      loc: `${siteUrl}/category/${c.slug}`,
      changefreq: 'hourly',
      priority: '0.8',
    })),
    ...articles.map((a) => ({
      loc: `${siteUrl}/news/${a.slug}`,
      lastmod: (a.updatedAt || a.publishedAt || a.createdAt || new Date().toISOString()).split('T')[0],
      changefreq: 'daily',
      priority: a.isBreaking || a.isFeatured ? '0.9' : '0.7',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}
