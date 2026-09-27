import React, { useState } from 'react';
import { Article, Category, Subcategory, Author } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Flame,
  Star,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface ArticleManagerProps {
  articles: Article[];
  categories: Category[];
  subcategories: Subcategory[];
  authors: Author[];
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => Promise<void>;
  onToggleStatus: (id: string, currentStatus: 'published' | 'draft') => Promise<void>;
  onViewLiveArticle: (slug: string) => void;
  onNavigateAutoFetch?: () => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  articles,
  categories,
  subcategories,
  authors,
  onCreateArticle,
  onEditArticle,
  onDeleteArticle,
  onToggleStatus,
  onViewLiveArticle,
  onNavigateAutoFetch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || a.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            News Articles Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Complete editorial oversight of published, draft, and featured articles
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onNavigateAutoFetch && (
            <button
              onClick={onNavigateAutoFetch}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Fetch News from URL</span>
            </button>
          )}

          <button
            onClick={onCreateArticle}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by headline, reporter name, or tags..."
            className="w-full bg-slate-950 border border-slate-700 text-white pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-red-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.nameHi})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Headline</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Author</th>
                <th className="py-3 px-3">Flags</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((art) => (
                <tr key={art.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={art.featuredImage}
                        alt=""
                        className="w-12 h-9 rounded-lg object-cover shrink-0 bg-slate-950 border border-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate max-w-xs">{art.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          /{art.slug} • {new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                      {art.categoryName}
                    </span>
                    {art.subcategoryName && (
                      <span className="block text-[9px] text-slate-400 mt-0.5">📍 {art.subcategoryName}</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-400 font-medium">{art.authorName}</td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {art.isBreaking && (
                        <span title="Breaking News" className="p-1 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px]">
                          <Flame className="w-3 h-3" />
                        </span>
                      )}
                      {art.isFeatured && (
                        <span title="Featured Story" className="p-1 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[9px]">
                          <Star className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => onToggleStatus(art.id, art.status === 'published' ? 'draft' : 'published')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                        art.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                          : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                      }`}
                    >
                      {art.status === 'published' ? '✓ Published' : 'Draft'}
                    </button>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400">{art.views.toLocaleString()}</td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewLiveArticle(art.slug)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditArticle(art)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900 text-indigo-300 transition-colors"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${art.title}"?`)) {
                            onDeleteArticle(art.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-rose-400 transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
