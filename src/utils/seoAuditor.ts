/**
 * Real-Time SEO Auditor Utility
 * Analyzes keyword density, title length, meta description presence, and content structure.
 */

export interface SeoAuditResult {
  score: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  ratingLabel: string;
  ratingColor: string;

  // Title Audit
  titleLength: number;
  titleStatus: 'missing' | 'too_short' | 'acceptable' | 'optimal' | 'slightly_long' | 'too_long';
  titleMessage: string;
  titleScore: number;

  // Meta Description Audit
  metaDescriptionLength: number;
  metaDescriptionPresent: boolean;
  metaDescriptionStatus: 'missing' | 'too_short' | 'acceptable' | 'optimal' | 'too_long';
  metaDescriptionMessage: string;
  metaDescriptionScore: number;

  // Focus Keyword & Density Audit
  focusKeyword: string;
  keywordDensity: number; // percentage, e.g. 1.8
  keywordMatches: number;
  keywordStatus: 'not_set' | 'missing' | 'low' | 'optimal' | 'high' | 'stuffing';
  keywordMessage: string;
  keywordDensityScore: number;

  // Keyword Placements
  keywordInTitle: boolean;
  keywordInMetaDescription: boolean;
  keywordInSlug: boolean;
  keywordInFirst100Words: boolean;
  keywordInHeadings: boolean;

  // Content Metrics
  wordCount: number;
  readingTimeMinutes: number;
  contentLengthStatus: 'thin' | 'moderate' | 'good' | 'comprehensive';
  contentScore: number;

  // Additional Checks
  hasFeaturedImage: boolean;
  hasSubheadings: boolean;
  hasLinks: boolean;
  slugValid: boolean;

  // Checklist Items
  checklist: SeoChecklistItem[];
  topKeywords: { word: string; count: number; density: number }[];
}

export interface SeoChecklistItem {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  importance: 'critical' | 'recommended' | 'optional';
}

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re',
  'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who',
  'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Common Hindi stop words in transliteration
  'ka', 'ki', 'ke', 'ko', 'hai', 'hain', 'mein', 'par', 'se', 'aur', 'kya', 'kyun', 'yah', 'vah', 'ye', 've',
  'ne', 'bhi', 'kuch', 'saath', 'baad', 'pehle', 'liya', 'diya', 'gaya', 'gayi', 'gaye', 'raha', 'rahi', 'rahe'
]);

/**
 * Strips HTML tags and normalizes whitespace
 */
export function extractPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Counts words including Unicode & Hindi scripts
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const matches = text.trim().match(/[\p{L}\p{N}_\-]+/gu);
  return matches ? matches.length : 0;
}

/**
 * Computes frequency and density of a focus keyword
 */
export function calculateKeywordFrequency(text: string, keyword: string): { matches: number; density: number; keywordWords: number } {
  const cleanKeyword = keyword.trim().toLowerCase();
  if (!cleanKeyword || !text) {
    return { matches: 0, density: 0, keywordWords: 0 };
  }

  const totalWords = countWords(text);
  if (totalWords === 0) {
    return { matches: 0, density: 0, keywordWords: 0 };
  }

  const keywordWords = countWords(cleanKeyword) || 1;
  const lowerText = text.toLowerCase();

  // Escape special regex characters in the keyword
  const escaped = cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=[^\\p{L}\\p{N}]|$)`, 'gui');
  const matchesArr = lowerText.match(regex);
  const matches = matchesArr ? matchesArr.length : 0;

  const density = totalWords > 0 ? Number(((matches * keywordWords) / totalWords * 100).toFixed(2)) : 0;

  return {
    matches,
    density,
    keywordWords,
  };
}

/**
 * Extracts top recurring keywords from content
 */
export function extractTopKeywords(text: string, limit = 5): { word: string; count: number; density: number }[] {
  const clean = text.toLowerCase();
  const tokens = clean.match(/[\p{L}\p{N}]{3,}/gu) || [];
  const totalWords = tokens.length;
  if (totalWords === 0) return [];

  const counts: Record<string, number> = {};
  for (const token of tokens) {
    if (!COMMON_STOP_WORDS.has(token) && isNaN(Number(token))) {
      counts[token] = (counts[token] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({
      word,
      count,
      density: Number(((count / totalWords) * 100).toFixed(1)),
    }));
}

/**
 * Runs a complete real-time SEO audit on article data
 */
export function runSeoAudit({
  title = '',
  shortDescription = '',
  content = '',
  slug = '',
  focusKeyword = '',
  featuredImage = '',
  imageCaption = '',
}: {
  title: string;
  shortDescription: string;
  content: string;
  slug: string;
  focusKeyword: string;
  featuredImage?: string;
  imageCaption?: string;
}): SeoAuditResult {
  const plainContent = extractPlainText(content);
  const wordCount = countWords(plainContent);
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // 1. Title Audit
  const titleTrimmed = title.trim();
  const titleLength = titleTrimmed.length;
  let titleStatus: SeoAuditResult['titleStatus'] = 'optimal';
  let titleMessage = '';
  let titleScore = 100;

  if (titleLength === 0) {
    titleStatus = 'missing';
    titleMessage = 'Missing article headline! A compelling title is required.';
    titleScore = 0;
  } else if (titleLength < 30) {
    titleStatus = 'too_short';
    titleMessage = `Too short (${titleLength} chars). Search engines favor descriptive titles between 40-60 chars.`;
    titleScore = 40;
  } else if (titleLength < 40) {
    titleStatus = 'acceptable';
    titleMessage = `Acceptable (${titleLength} chars). Consider making it slightly more descriptive (40-60 chars).`;
    titleScore = 80;
  } else if (titleLength <= 60) {
    titleStatus = 'optimal';
    titleMessage = `Optimal length (${titleLength}/60 chars)! Perfect for Google search results without truncation.`;
    titleScore = 100;
  } else if (titleLength <= 70) {
    titleStatus = 'slightly_long';
    titleMessage = `Slightly long (${titleLength} chars). Google may truncate the end on smaller mobile screens.`;
    titleScore = 75;
  } else {
    titleStatus = 'too_long';
    titleMessage = `Too long (${titleLength} chars). Google SERP will cut off this title with "..."`;
    titleScore = 50;
  }

  // 2. Meta Description (Short Description) Audit
  const metaTrimmed = shortDescription.trim();
  const metaDescriptionLength = metaTrimmed.length;
  const metaDescriptionPresent = metaDescriptionLength > 0;
  let metaDescriptionStatus: SeoAuditResult['metaDescriptionStatus'] = 'optimal';
  let metaDescriptionMessage = '';
  let metaDescriptionScore = 100;

  if (!metaDescriptionPresent) {
    metaDescriptionStatus = 'missing';
    metaDescriptionMessage = 'Missing meta description! Google will auto-generate an excerpt that may miss your key hook.';
    metaDescriptionScore = 0;
  } else if (metaDescriptionLength < 70) {
    metaDescriptionStatus = 'too_short';
    metaDescriptionMessage = `Too short (${metaDescriptionLength} chars). Expand to 120-160 chars to maximize click-through rate.`;
    metaDescriptionScore = 55;
  } else if (metaDescriptionLength < 120) {
    metaDescriptionStatus = 'acceptable';
    metaDescriptionMessage = `Good start (${metaDescriptionLength} chars). Ideal Google snippet length is 120-160 chars.`;
    metaDescriptionScore = 85;
  } else if (metaDescriptionLength <= 160) {
    metaDescriptionStatus = 'optimal';
    metaDescriptionMessage = `Optimal length (${metaDescriptionLength}/160 chars)! Perfect snippet length for Google SERP.`;
    metaDescriptionScore = 100;
  } else {
    metaDescriptionStatus = 'too_long';
    metaDescriptionMessage = `Too long (${metaDescriptionLength} chars). Snippet will be truncated after ~160 characters.`;
    metaDescriptionScore = 70;
  }

  // 3. Focus Keyword & Density Audit
  const kw = focusKeyword.trim().toLowerCase();
  let keywordDensity = 0;
  let keywordMatches = 0;
  let keywordStatus: SeoAuditResult['keywordStatus'] = 'not_set';
  let keywordMessage = '';
  let keywordDensityScore = 70;

  if (!kw) {
    keywordStatus = 'not_set';
    keywordMessage = 'No target keyword specified. Enter a focus keyword to analyze density and SERP optimization.';
    keywordDensityScore = 50;
  } else {
    const kwAnalysis = calculateKeywordFrequency(plainContent, kw);
    keywordMatches = kwAnalysis.matches;
    keywordDensity = kwAnalysis.density;

    if (keywordMatches === 0) {
      keywordStatus = 'missing';
      keywordMessage = `Keyword "${focusKeyword}" not found in article body. Incorporate it naturally in your paragraphs.`;
      keywordDensityScore = 20;
    } else if (keywordDensity < 0.8) {
      keywordStatus = 'low';
      keywordMessage = `Low keyword density (${keywordDensity}% - ${keywordMatches} matches). Aim for 1.0% - 2.5% for strong topical relevance.`;
      keywordDensityScore = 70;
    } else if (keywordDensity <= 2.5) {
      keywordStatus = 'optimal';
      keywordMessage = `Optimal keyword density (${keywordDensity}% - ${keywordMatches} matches)! Great topical authority without keyword stuffing.`;
      keywordDensityScore = 100;
    } else if (keywordDensity <= 3.5) {
      keywordStatus = 'high';
      keywordMessage = `High density (${keywordDensity}% - ${keywordMatches} matches). Consider slightly reducing frequency to stay safe from search penalties.`;
      keywordDensityScore = 65;
    } else {
      keywordStatus = 'stuffing';
      keywordMessage = `Warning: Potential keyword stuffing (${keywordDensity}% - ${keywordMatches} matches)! Risk of Google Panda / Spam penalty.`;
      keywordDensityScore = 30;
    }
  }

  // Keyword Placements
  const keywordInTitle = kw ? titleTrimmed.toLowerCase().includes(kw) : false;
  const keywordInMetaDescription = kw ? metaTrimmed.toLowerCase().includes(kw) : false;
  const keywordInSlug = kw ? slug.toLowerCase().replace(/[^a-z0-9]/g, '').includes(kw.replace(/[^a-z0-9]/g, '')) : false;

  // First 100 words check
  const first100Words = plainContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  const keywordInFirst100Words = kw ? first100Words.includes(kw) : false;

  // Headings check in HTML content
  const hasSubheadings = /<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/i.test(content) || /<strong[^>]*>[\s\S]*?<\/strong>/i.test(content);
  const headingsMatch = content.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi);
  const keywordInHeadings = kw && headingsMatch ? headingsMatch.some((h) => h.toLowerCase().includes(kw)) : false;

  // Content Length Audit
  let contentLengthStatus: SeoAuditResult['contentLengthStatus'] = 'good';
  let contentScore = 100;
  if (wordCount === 0) {
    contentLengthStatus = 'thin';
    contentScore = 0;
  } else if (wordCount < 150) {
    contentLengthStatus = 'thin';
    contentScore = 40;
  } else if (wordCount < 300) {
    contentLengthStatus = 'moderate';
    contentScore = 75;
  } else if (wordCount < 600) {
    contentLengthStatus = 'good';
    contentScore = 95;
  } else {
    contentLengthStatus = 'comprehensive';
    contentScore = 100;
  }

  const hasFeaturedImage = Boolean(featuredImage && featuredImage.trim().length > 5);
  const hasLinks = /<a\s+[^>]*href=/i.test(content);
  const slugValid = Boolean(slug && /^[a-z0-9-]+$/i.test(slug.trim()));

  // 4. Checklist Items
  const checklist: SeoChecklistItem[] = [
    {
      id: 'title_length',
      label: 'Title Length (40-60 characters)',
      status: titleStatus === 'optimal' ? 'passed' : titleStatus === 'acceptable' || titleStatus === 'slightly_long' ? 'warning' : 'failed',
      message: titleMessage,
      importance: 'critical',
    },
    {
      id: 'meta_presence',
      label: 'Meta Description Presence & Length (120-160 characters)',
      status: metaDescriptionStatus === 'optimal' ? 'passed' : metaDescriptionStatus === 'acceptable' ? 'warning' : 'failed',
      message: metaDescriptionMessage,
      importance: 'critical',
    },
    {
      id: 'keyword_density',
      label: 'Keyword Density (Target: 1.0% - 2.5%)',
      status: keywordStatus === 'optimal' ? 'passed' : keywordStatus === 'low' || keywordStatus === 'high' ? 'warning' : 'failed',
      message: keywordMessage,
      importance: 'critical',
    },
    {
      id: 'keyword_in_title',
      label: 'Focus Keyword in Article Title',
      status: !kw ? 'warning' : keywordInTitle ? 'passed' : 'failed',
      message: !kw ? 'Set a focus keyword to check title placement.' : keywordInTitle ? 'Focus keyword is present in the headline.' : 'Add your focus keyword into the headline for higher search ranking.',
      importance: 'critical',
    },
    {
      id: 'keyword_in_meta',
      label: 'Focus Keyword in Meta Description',
      status: !kw ? 'warning' : keywordInMetaDescription ? 'passed' : 'failed',
      message: !kw ? 'Set a focus keyword to check meta placement.' : keywordInMetaDescription ? 'Focus keyword is included in the meta description.' : 'Include the focus keyword in the meta description to increase click-throughs.',
      importance: 'recommended',
    },
    {
      id: 'keyword_in_first100',
      label: 'Keyword in First 100 Words (Lead Paragraph)',
      status: !kw ? 'warning' : keywordInFirst100Words ? 'passed' : 'failed',
      message: !kw ? 'Set a focus keyword to check lead paragraph.' : keywordInFirst100Words ? 'Focus keyword appears early in the opening paragraph.' : 'Mention the focus keyword within the first 100 words for strong relevance.',
      importance: 'recommended',
    },
    {
      id: 'content_word_count',
      label: 'Article Word Count (Minimum 300+ words)',
      status: wordCount >= 300 ? 'passed' : wordCount >= 150 ? 'warning' : 'failed',
      message: `${wordCount} words (${readingTimeMinutes} min read). ${wordCount >= 300 ? 'Good in-depth journalism length.' : 'Add more detail to satisfy search intent.'}`,
      importance: 'critical',
    },
    {
      id: 'featured_image',
      label: 'Featured Image & Media',
      status: hasFeaturedImage ? 'passed' : 'failed',
      message: hasFeaturedImage ? 'Featured image is set for Google News & social cards.' : 'Add a high-resolution featured image for Google Discover & News.',
      importance: 'recommended',
    },
    {
      id: 'slug_structure',
      label: 'Clean, SEO-Friendly URL Slug',
      status: slugValid ? 'passed' : 'failed',
      message: slugValid ? `Slug "${slug}" is URL-safe and hyphenated.` : 'Ensure the slug is lowercase letters, numbers, and hyphens.',
      importance: 'recommended',
    },
    {
      id: 'subheadings',
      label: 'Subheadings (H2/H3 Structure)',
      status: hasSubheadings ? 'passed' : 'warning',
      message: hasSubheadings ? 'Subheadings present to break up paragraphs for readers.' : 'Add H2 or H3 subheadings to improve scannability and SEO.',
      importance: 'optional',
    },
  ];

  // 5. Overall Weighted Score Calculation (0 - 100)
  // Weights:
  // Title: 25%
  // Meta description: 25%
  // Keyword density & placement: 25%
  // Content depth & media: 25%
  let keywordPlacementScore = 50;
  if (kw) {
    let placementMatches = 0;
    if (keywordInTitle) placementMatches += 35;
    if (keywordInMetaDescription) placementMatches += 25;
    if (keywordInFirst100Words) placementMatches += 25;
    if (keywordInSlug) placementMatches += 15;
    keywordPlacementScore = Math.min(100, (keywordDensityScore * 0.5) + (placementMatches * 0.5));
  } else {
    keywordPlacementScore = 50;
  }

  let technicalScore = 0;
  if (contentScore >= 75) technicalScore += 40;
  else technicalScore += contentScore * 0.4;
  if (hasFeaturedImage) technicalScore += 30;
  if (slugValid) technicalScore += 20;
  if (hasSubheadings) technicalScore += 10;

  const totalScore = Math.round(
    (titleScore * 0.25) +
    (metaDescriptionScore * 0.25) +
    (keywordPlacementScore * 0.25) +
    (technicalScore * 0.25)
  );

  let rating: SeoAuditResult['rating'] = 'poor';
  let ratingLabel = 'Needs Work';
  let ratingColor = 'text-red-400 border-red-500/30 bg-red-500/10';

  if (totalScore >= 85) {
    rating = 'excellent';
    ratingLabel = 'SEO Optimized (Grade A)';
    ratingColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (totalScore >= 70) {
    rating = 'good';
    ratingLabel = 'Good SEO (Grade B)';
    ratingColor = 'text-teal-400 border-teal-500/30 bg-teal-500/10';
  } else if (totalScore >= 50) {
    rating = 'needs_improvement';
    ratingLabel = 'Needs Improvement (Grade C)';
    ratingColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else {
    rating = 'poor';
    ratingLabel = 'Poor SEO (Grade D)';
    ratingColor = 'text-red-400 border-red-500/30 bg-red-500/10';
  }

  const topKeywords = extractTopKeywords(plainContent, 6);

  return {
    score: Math.max(0, Math.min(100, totalScore)),
    rating,
    ratingLabel,
    ratingColor,
    titleLength,
    titleStatus,
    titleMessage,
    titleScore,
    metaDescriptionLength,
    metaDescriptionPresent,
    metaDescriptionStatus,
    metaDescriptionMessage,
    metaDescriptionScore,
    focusKeyword,
    keywordDensity,
    keywordMatches,
    keywordStatus,
    keywordMessage,
    keywordDensityScore,
    keywordInTitle,
    keywordInMetaDescription,
    keywordInSlug,
    keywordInFirst100Words,
    keywordInHeadings,
    wordCount,
    readingTimeMinutes,
    contentLengthStatus,
    contentScore,
    hasFeaturedImage,
    hasSubheadings,
    hasLinks,
    slugValid,
    checklist,
    topKeywords,
  };
}
