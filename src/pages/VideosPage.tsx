import React, { useState, useEffect } from 'react';
import { VideoNews } from '../types';
import { dbService } from '../services/db';
import { Play, Video, Eye, Clock, X, ChevronRight } from 'lucide-react';

export interface VideosPageProps {
  videos?: VideoNews[];
  onNavigate?: (path: string) => void;
  onSelectArticle?: (slug: string) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({
  videos: initialVideos,
  onNavigate,
  onSelectArticle,
}) => {
  const [videoList, setVideoList] = useState<VideoNews[]>(initialVideos || []);
  const [activeVideo, setActiveVideo] = useState<VideoNews | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!initialVideos || initialVideos.length === 0) {
      dbService.getVideos().then((data) => setVideoList(data || []));
    } else {
      setVideoList(initialVideos);
    }
  }, [initialVideos]);

  const handleNavigate = (path: string) => {
    if (onNavigate) onNavigate(path);
  };

  const categories = Array.from(new Set((videoList || []).map((v) => v.categoryName).filter(Boolean)));
  const filtered = selectedCategory === 'all'
    ? (videoList || [])
    : (videoList || []).filter((v) => v.categoryName === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <button onClick={() => handleNavigate('/')} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">वीडियो बुलेटिन</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Video className="w-6 h-6 text-red-500" />
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            गैजेट ग्लो वीडियो गैलरी
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300">
          देश, प्रदेश, राजनीति और अपराध से जुड़े मुख्य समाचारों के ग्राउंड वीडियो रिपोर्ट और लाइव बुलेटिन।
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              selectedCategory === 'all' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            सभी वीडियो
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vid) => (
          <div
            key={vid.id}
            onClick={() => setActiveVideo(vid)}
            className="group cursor-pointer bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="aspect-16/9 relative overflow-hidden bg-black">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1 fill-white" />
                </div>
              </div>
              {vid.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono px-2 py-0.5 rounded text-white">
                  {vid.duration}
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-600 uppercase mb-1 block">
                  {vid.categoryName}
                </span>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                  {vid.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-neutral-100">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {(vid.views || 0).toLocaleString()} दृश्य
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(vid.publishedAt || Date.now()).toLocaleDateString('hi-IN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-4xl bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white truncate pr-4">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-16/9 w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
