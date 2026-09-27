import React, { useState } from 'react';
import {
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Image as ImageIcon,
  Code,
  Upload,
  Sparkles,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  X,
} from 'lucide-react';

export interface MediaEmbedToolbarProps {
  onInsertContent: (htmlToInsert: string) => void;
  onSelectFeaturedImage?: (url: string, caption?: string, credit?: string) => void;
}

export const STOCK_NEWS_IMAGES = [
  {
    category: 'Politics & Governance',
    images: [
      {
        title: 'Parliament House',
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
        caption: 'Parliament House, New Delhi',
        credit: 'News Bureau',
      },
      {
        title: 'Press Conference',
        url: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=1200&auto=format&fit=crop&q=80',
        caption: 'Official Press Briefing',
        credit: 'Media Bureau',
      },
      {
        title: 'Elections & Voting',
        url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&auto=format&fit=crop&q=80',
        caption: 'Democratic Polling & Electoral Process',
        credit: 'Election Commission',
      },
    ],
  },
  {
    category: 'Infrastructure & Regional',
    images: [
      {
        title: 'Secretariat & Administration',
        url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
        caption: 'Civil Secretariat Headquarters',
        credit: 'DPR Bureau',
      },
      {
        title: 'Agriculture & Farming',
        url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
        caption: 'Agricultural Development & Crop Harvesting',
        credit: 'Agri Dept',
      },
      {
        title: 'Highways & Expressways',
        url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&auto=format&fit=crop&q=80',
        caption: 'National Highway and Expressway Network',
        credit: 'NHAI',
      },
    ],
  },
  {
    category: 'Law, Justice & Security',
    images: [
      {
        title: 'Police & Public Safety',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
        caption: 'Police Department Security Operations',
        credit: 'Police Bureau',
      },
      {
        title: 'Judiciary & High Court',
        url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
        caption: 'Judicial Hearing at High Court',
        credit: 'Legal Bureau',
      },
    ],
  },
  {
    category: 'Economy, Business & Markets',
    images: [
      {
        title: 'Stock Exchange & Markets',
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Stock Index and Financial Exchange',
        credit: 'Market Desk',
      },
      {
        title: 'Banking & Budget',
        url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
        caption: 'Annual Budget & Fiscal Policy',
        credit: 'Finance Bureau',
      },
    ],
  },
];

export const MediaEmbedToolbar: React.FC<MediaEmbedToolbarProps> = ({
  onInsertContent,
  onSelectFeaturedImage,
}) => {
  const [activeModal, setActiveModal] = useState<
    'none' | 'youtube' | 'social' | 'image' | 'custom_html' | 'presets'
  >('none');

  // YouTube modal states
  const [ytUrl, setYtUrl] = useState('');
  const [ytCaption, setYtCaption] = useState('');

  // Social embed states
  const [socialPlatform, setSocialPlatform] = useState<'twitter' | 'facebook' | 'instagram'>('twitter');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialAuthor, setSocialAuthor] = useState('');
  const [socialText, setSocialText] = useState('');

  // Image states
  const [imgUrl, setImgUrl] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgCredit, setImgCredit] = useState('');
  const [imgAlign, setImgAlign] = useState<'center' | 'left' | 'right'>('center');

  // Custom HTML state
  const [rawHtml, setRawHtml] = useState('');

  // Helper: Extract YouTube ID
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url.length === 11 ? url : null;
  };

  // Helper: Upload file to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (isFeatured && onSelectFeaturedImage) {
        onSelectFeaturedImage(base64, file.name.replace(/\.[^/.]+$/, ''), 'Uploaded Media');
      } else {
        setImgUrl(base64);
        if (!imgCaption) setImgCaption(file.name.replace(/\.[^/.]+$/, ''));
        if (!imgCredit) setImgCredit('Staff Photo');
      }
    };
    reader.readAsDataURL(file);
  };

  // Insert YouTube Embed
  const handleInsertYouTube = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(ytUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL or Video ID');
      return;
    }

    const embedHtml = `
<div class="video-embed-container" data-embed-type="youtube" data-video-id="${videoId}">
  <div class="video-embed-wrapper">
    <iframe
      src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0"
      title="${ytCaption || 'YouTube Video'}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>
  ${ytCaption ? `<div class="embed-caption">🎥 <span>${ytCaption}</span></div>` : ''}
</div>
`;
    onInsertContent(embedHtml);
    setYtUrl('');
    setYtCaption('');
    setActiveModal('none');
  };

  // Insert Social Embed (Twitter/X, Facebook, Instagram)
  const handleInsertSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialUrl) return;

    let embedHtml = '';

    if (socialPlatform === 'twitter') {
      embedHtml = `
<div class="social-embed-card twitter-embed" data-embed-type="twitter" data-url="${socialUrl}">
  <div class="embed-header bg-slate-900 text-white flex items-center justify-between p-2 rounded-t">
    <div class="flex items-center gap-2">
      <span class="text-sky-400 font-bold">𝕏 / Twitter</span>
      <span class="text-xs text-slate-400">${socialAuthor || 'Official Post'}</span>
    </div>
    <a href="${socialUrl}" target="_blank" rel="noreferrer" class="text-[11px] text-sky-400 hover:underline">View original post ↗</a>
  </div>
  <div class="embed-body p-4 bg-slate-50 text-slate-800 text-sm italic">
    ${socialText ? `"${socialText}"` : 'Click the button below to view this update directly on X/Twitter.'}
  </div>
  <div class="px-4 py-2 bg-slate-100 border-t border-slate-200 text-right">
    <a href="${socialUrl}" target="_blank" rel="noreferrer" class="inline-block bg-slate-900 text-white text-xs px-3 py-1 rounded font-bold">Open on 𝕏</a>
  </div>
</div>
`;
    } else if (socialPlatform === 'facebook') {
      const fbEncoded = encodeURIComponent(socialUrl);
      embedHtml = `
<div class="social-embed-card facebook-embed" data-embed-type="facebook" data-url="${socialUrl}">
  <div class="embed-header bg-blue-700 text-white flex items-center justify-between p-2 rounded-t">
    <div class="flex items-center gap-2">
      <span class="font-bold">Facebook Post</span>
      <span class="text-xs text-blue-200">${socialAuthor || 'Facebook'}</span>
    </div>
    <a href="${socialUrl}" target="_blank" rel="noreferrer" class="text-[11px] text-blue-200 hover:underline">View on Facebook ↗</a>
  </div>
  <div class="embed-body p-4 bg-slate-50 text-slate-800 text-sm">
    <div class="video-embed-wrapper">
      <iframe
        src="https://www.facebook.com/plugins/post.php?href=${fbEncoded}&show_text=true&width=500"
        width="100%"
        height="350"
        style="border:none;overflow:hidden"
        scrolling="no"
        frameborder="0"
        allowfullscreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      ></iframe>
    </div>
  </div>
</div>
`;
    } else if (socialPlatform === 'instagram') {
      const cleanIg = socialUrl.replace(/\/$/, '');
      const embedUrl = cleanIg.includes('/embed') ? cleanIg : `${cleanIg}/embed`;
      embedHtml = `
<div class="social-embed-card instagram-embed" data-embed-type="instagram" data-url="${socialUrl}">
  <div class="embed-header bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white flex items-center justify-between p-2 rounded-t">
    <div class="flex items-center gap-2">
      <span class="font-bold">Instagram Reel / Post</span>
      <span class="text-xs text-pink-100">${socialAuthor || '@gadgetglow'}</span>
    </div>
    <a href="${socialUrl}" target="_blank" rel="noreferrer" class="text-[11px] text-pink-100 hover:underline">View on Instagram ↗</a>
  </div>
  <div class="embed-body p-2 bg-slate-50 flex justify-center">
    <iframe
      src="${embedUrl}"
      width="100%"
      height="450"
      frameborder="0"
      scrolling="no"
      allowtransparency="true"
      style="max-width:450px;border-radius:8px;"
    ></iframe>
  </div>
</div>
`;
    }

    onInsertContent(embedHtml);
    setSocialUrl('');
    setSocialAuthor('');
    setSocialText('');
    setActiveModal('none');
  };

  // Insert Inline Image
  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrl) return;

    let alignClasses = 'w-full my-4';
    if (imgAlign === 'left') alignClasses = 'sm:w-1/2 sm:float-left sm:mr-4 my-3';
    else if (imgAlign === 'right') alignClasses = 'sm:w-1/2 sm:float-right sm:ml-4 my-3';

    const figureHtml = `
<figure class="${alignClasses}">
  <img src="${imgUrl}" alt="${imgCaption || 'News Article Media'}" class="rounded-lg shadow-sm w-full object-cover" />
  ${imgCaption || imgCredit ? `<figcaption class="text-xs text-slate-500 text-center mt-1.5">${imgCaption} ${imgCredit ? `(Photo: ${imgCredit})` : ''}</figcaption>` : ''}
</figure>
`;
    onInsertContent(figureHtml);
    setImgUrl('');
    setImgCaption('');
    setImgCredit('');
    setActiveModal('none');
  };

  // Insert Custom HTML
  const handleInsertCustomHtml = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawHtml.trim()) return;
    onInsertContent(rawHtml.trim());
    setRawHtml('');
    setActiveModal('none');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-slate-200">
      {/* Action Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Rich Media & Embed Tools
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* YouTube Insert Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'youtube' ? 'none' : 'youtube')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeModal === 'youtube'
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube Video</span>
          </button>

          {/* Social Media Embed Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'social' ? 'none' : 'social')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeModal === 'social'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>Social Embed (X/FB/IG)</span>
          </button>

          {/* Inline Image Insert Button */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'image' ? 'none' : 'image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeModal === 'image'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Inline Photo</span>
          </button>

          {/* Stock News Image Library */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'presets' ? 'none' : 'presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeModal === 'presets'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stock Library</span>
          </button>

          {/* Custom HTML Code Insert */}
          <button
            type="button"
            onClick={() => setActiveModal(activeModal === 'custom_html' ? 'none' : 'custom_html')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeModal === 'custom_html'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Custom HTML</span>
          </button>
        </div>
      </div>

      {/* 1. YouTube Video Modal */}
      {activeModal === 'youtube' && (
        <form onSubmit={handleInsertYouTube} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-red-400">
            <span className="flex items-center gap-1.5">
              <Youtube className="w-4 h-4" /> Embed YouTube Video into Article
            </span>
            <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube URL or Video ID *</label>
              <input
                type="text"
                required
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or ID"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Video Caption / Title (Optional)</label>
              <input
                type="text"
                value={ytCaption}
                onChange={(e) => setYtCaption(e.target.value)}
                placeholder="e.g., Live Press Conference Coverage"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Live Preview if valid ID */}
          {ytUrl && (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <span className="text-[11px] text-slate-400">Extracted Video ID:</span>
              <span className="text-xs font-mono text-emerald-400">{extractYouTubeId(ytUrl)}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Insert Video Embed</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Social Media Embed Modal (Twitter, FB, IG) */}
      {activeModal === 'social' && (
        <form onSubmit={handleInsertSocial} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
            <span className="flex items-center gap-1.5">
              <Twitter className="w-4 h-4" /> Embed Social Media Post (X / Twitter / Facebook / Instagram)
            </span>
            <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Platform Selector Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setSocialPlatform('twitter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                socialPlatform === 'twitter' ? 'bg-slate-950 text-white border border-slate-700' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              <span>𝕏 (Twitter)</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialPlatform('facebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                socialPlatform === 'facebook' ? 'bg-blue-900 text-white border border-blue-700' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Facebook className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialPlatform('instagram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                socialPlatform === 'instagram' ? 'bg-pink-950 text-white border border-pink-700' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {socialPlatform === 'twitter' && 'Tweet URL (e.g., https://x.com/user/status/...)'}
                {socialPlatform === 'facebook' && 'Facebook Post or Video URL'}
                {socialPlatform === 'instagram' && 'Instagram Post / Reel URL (e.g., https://www.instagram.com/p/...)'}
                *
              </label>
              <input
                type="text"
                required
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Account Handle (e.g., @user)</label>
              <input
                type="text"
                value={socialAuthor}
                onChange={(e) => setSocialAuthor(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {socialPlatform === 'twitter' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tweet Text / Quote (Optional)</label>
              <textarea
                rows={2}
                value={socialText}
                onChange={(e) => setSocialText(e.target.value)}
                placeholder="Key excerpt or quote from the tweet..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Insert Embed Card</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Inline Image Insert Modal */}
      {activeModal === 'image' && (
        <form onSubmit={handleInsertImage} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" /> Insert Inline Photo / Diagram
            </span>
            <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image Web URL *</label>
                <input
                  type="url"
                  required
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Local File Upload Option */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload from Local Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  placeholder="Image Caption"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={imgCredit}
                  onChange={(e) => setImgCredit(e.target.value)}
                  placeholder="Photo Credit (e.g., Staff Photographer)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                />
              </div>

              {/* Alignment Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400">Photo Alignment:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setImgAlign('center')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 ${
                      imgAlign === 'center' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <AlignCenter className="w-3 h-3" />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgAlign('left')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 ${
                      imgAlign === 'left' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <AlignLeft className="w-3 h-3" />
                    <span>Left Wrap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgAlign('right')}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 ${
                      imgAlign === 'right' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <AlignRight className="w-3 h-3" />
                    <span>Right Wrap</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Box */}
            <div className="sm:col-span-4">
              <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-500">Image Preview</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Insert Photo</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Stock News Image Library Presets */}
      {activeModal === 'presets' && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Editorial Photo Library (1-Click Presets)
            </span>
            <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {STOCK_NEWS_IMAGES.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">
                  {group.category}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {group.images.map((img, iIdx) => (
                    <div
                      key={iIdx}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-amber-500 transition-colors"
                    >
                      <div className="aspect-16/10 overflow-hidden relative">
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2 text-xs">
                        <p className="font-bold text-white truncate">{img.title}</p>
                        <div className="flex gap-1.5 mt-2">
                          {onSelectFeaturedImage && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectFeaturedImage(img.url, img.caption, img.credit);
                                setActiveModal('none');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex-1"
                            >
                              Set Lead
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const figureHtml = `
<figure class="w-full my-4">
  <img src="${img.url}" alt="${img.title}" class="rounded-lg shadow-sm w-full object-cover" />
  <figcaption class="text-xs text-slate-500 text-center mt-1.5">${img.caption} (Photo: ${img.credit})</figcaption>
</figure>
`;
                              onInsertContent(figureHtml);
                              setActiveModal('none');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded-lg text-[10px] font-bold flex-1"
                          >
                            Insert
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Custom HTML / Iframe Modal */}
      {activeModal === 'custom_html' && (
        <form onSubmit={handleInsertCustomHtml} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-purple-400">
            <span className="flex items-center gap-1.5">
              <Code className="w-4 h-4" /> Custom HTML, Iframe Embed or Widget Code
            </span>
            <button type="button" onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <textarea
              rows={4}
              required
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              placeholder="<iframe src='...' width='100%' height='400'></iframe>"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Insert HTML Snippet</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
