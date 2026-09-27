import React, { useState, useEffect } from 'react';
import { EPaperEdition } from '../types';
import { dbService } from '../services/db';
import { FileText, Calendar, Download, Eye, ChevronLeft, ChevronRight, Share2, ZoomIn, ZoomOut } from 'lucide-react';

export interface EPaperPageProps {
  onNavigate?: (path: string) => void;
  onNavigateHome?: () => void;
}

export const EPaperPage: React.FC<EPaperPageProps> = ({ onNavigate, onNavigateHome }) => {
  const [editions, setEditions] = useState<EPaperEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<EPaperEdition | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleNavigateHome = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('/');
  };

  useEffect(() => {
    let mounted = true;
    dbService.getEPapers().then((data) => {
      if (mounted) {
        setEditions(data || []);
        if (data && data.length > 0) {
          setSelectedEdition(data[0]);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!selectedEdition) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        ई-पेपर संस्करण लोड हो रहे हैं...
      </div>
    );
  }

  const pages = (selectedEdition.pages && selectedEdition.pages.length > 0)
    ? selectedEdition.pages
    : [selectedEdition.thumbnailUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <button onClick={handleNavigateHome} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">डिजिटल ई-पेपर</span>
      </nav>

      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-5 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-white">
              गैजेट ग्लो दैनिक ई-पेपर (E-Paper)
            </h1>
            <p className="text-xs text-amber-300 font-medium">
              संस्करण: {selectedEdition.editionName} • दिनांक: {new Date(selectedEdition.date || Date.now()).toLocaleDateString('hi-IN', { dateStyle: 'full' })}
            </p>
          </div>
        </div>

        {/* Edition Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">संस्करण चुनें:</label>
          <select
            value={selectedEdition.id}
            onChange={(e) => {
              const found = editions.find((ed) => ed.id === e.target.value);
              if (found) {
                setSelectedEdition(found);
                setCurrentPage(0);
              }
            }}
            className="bg-slate-800 text-white text-xs px-3 py-2 rounded border border-slate-700 focus:outline-none"
          >
            {editions.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.editionName} ({ed.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reader Viewer */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs mb-8">
        {/* Reader Top Controls */}
        <div className="bg-slate-100 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded bg-white border border-neutral-300 text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700">
              पृष्ठ {currentPage + 1} / {pages.length}
            </span>
            <button
              disabled={currentPage === pages.length - 1}
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              className="p-1.5 rounded bg-white border border-neutral-300 text-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 rounded bg-white border border-neutral-300 text-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
              className="p-1.5 rounded bg-white border border-neutral-300 text-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {selectedEdition.pdfUrl && (
              <a
                href={selectedEdition.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                डाउनलोड PDF
              </a>
            )}
          </div>
        </div>

        {/* Paper Canvas Display */}
        <div className="p-4 sm:p-8 bg-neutral-200/50 flex items-center justify-center overflow-auto min-h-[550px]">
          <div
            className="bg-white shadow-2xl transition-transform duration-200 max-w-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="w-auto max-h-[850px] object-contain border border-neutral-300 shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
