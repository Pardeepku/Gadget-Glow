import React, { useState } from 'react';
import { BreakingNews } from '../../types';
import { Flame, Plus, Trash2, Edit2, CheckCircle, Clock, Link as LinkIcon, Save, X } from 'lucide-react';

interface BreakingNewsManagerProps {
  breakingNews: BreakingNews[];
  onAdd: (item: Omit<BreakingNews, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (id: string, item: Partial<BreakingNews>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const BreakingNewsManager: React.FC<BreakingNewsManagerProps> = ({
  breakingNews,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<BreakingNews['priority']>('high');
  const [isActive, setIsActive] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      await onUpdate(editingId, {
        title: title.trim(),
        url: url.trim() || undefined,
        priority,
        isActive,
      });
      setEditingId(null);
    } else {
      await onAdd({
        title: title.trim(),
        url: url.trim() || undefined,
        priority,
        isActive,
      });
      setIsAdding(false);
    }

    setTitle('');
    setUrl('');
    setPriority('high');
    setIsActive(true);
  };

  const startEdit = (item: BreakingNews) => {
    setEditingId(item.id);
    setTitle(item.title);
    setUrl(item.url || '');
    setPriority(item.priority || 'high');
    setIsActive(item.isActive);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Breaking News Ticker Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time scrolling ticker headlines displayed across the top banner of the website
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setUrl('');
              setIsAdding(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Breaking News</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              {editingId ? 'Edit Breaking Alert' : 'Create New Breaking News Alert'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Breaking News Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Major Policy Announced: Emergency Disaster Relief Package approved by Cabinet..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Click-through Link (Optional URL)
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/news/major-policy-announcement"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-2.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="critical">Critical / Red Alert</option>
                <option value="high">High Priority</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-red-600"
              />
              <span>Display in Live Scrolling Ticker</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Alert</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Breaking Items List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Active & Archived Breaking News ({breakingNews.length})
        </div>

        <div className="divide-y divide-slate-800">
          {breakingNews.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                    item.priority === 'critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {item.priority || 'high'}
                </span>
                <div>
                  <div className="font-semibold text-white text-xs sm:text-sm">{item.title}</div>
                  {item.url && (
                    <div className="text-[10px] text-sky-400 font-mono flex items-center gap-1 mt-0.5">
                      <LinkIcon className="w-3 h-3" />
                      <span>{item.url}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => onUpdate(item.id, { isActive: !item.isActive })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    item.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.isActive ? 'Active (Live)' : 'Inactive'}
                </button>

                <button
                  onClick={() => startEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this breaking news alert?')) {
                      onDelete(item.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
