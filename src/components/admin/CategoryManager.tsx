import React, { useState } from 'react';
import { Category, Subcategory } from '../../types';
import { FolderTree, Plus, Edit2, Trash2, MapPin, Save, X } from 'lucide-react';
import { generateSlug } from '../../utils/slugify';

interface CategoryManagerProps {
  categories: Category[];
  subcategories: Subcategory[];
  onAddCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (id: string, cat: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onAddSubcategory: (sub: Omit<Subcategory, 'id'>) => Promise<void>;
  onDeleteSubcategory: (id: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  subcategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onDeleteSubcategory,
}) => {
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [nameHi, setNameHi] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Subcategory Add state
  const [isAddingSub, setIsAddingSub] = useState<string | null>(null);
  const [subNameHi, setSubNameHi] = useState('');
  const [subNameEn, setSubNameEn] = useState('');
  const [subSlug, setSubSlug] = useState('');

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameHi || !nameEn) return;

    await onAddCategory({
      name: nameEn.trim(),
      nameHi: nameHi.trim(),
      slug: slug.trim() || generateSlug(nameEn.trim()),
      description: description.trim() || undefined,
      order: categories.length + 1,
      isActive: true,
    });

    setIsAddingCat(false);
    setNameHi('');
    setNameEn('');
    setSlug('');
    setDescription('');
  };

  const handleSaveSubcategory = async (parentId: string, parentName: string) => {
    if (!subNameHi || !subNameEn) return;

    await onAddSubcategory({
      parentCategoryId: parentId,
      parentCategoryName: parentName,
      name: subNameEn.trim(),
      nameHi: subNameHi.trim(),
      slug: subSlug.trim() || generateSlug(subNameEn.trim()),
      isActive: true,
    });

    setIsAddingSub(null);
    setSubNameHi('');
    setSubNameEn('');
    setSubSlug('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-indigo-500" />
            Categories & Districts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organize main content categories and localized district subcategories (Haryana, National, Sports, Business)
          </p>
        </div>

        {!isAddingCat && (
          <button
            onClick={() => setIsAddingCat(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {/* Add Category Form */}
      {isAddingCat && (
        <form onSubmit={handleSaveCategory} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white">Create New News Category</h2>
            <button type="button" onClick={() => setIsAddingCat(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hindi Display Name *</label>
              <input
                type="text"
                required
                value={nameHi}
                onChange={(e) => {
                  setNameHi(e.target.value);
                  if (!slug) setSlug(generateSlug(e.target.value));
                }}
                placeholder="e.g., शिक्षा & करियर"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">English Name *</label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  if (!slug) setSlug(generateSlug(e.target.value));
                }}
                placeholder="e.g., Education & Career"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="education"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for SEO and section header..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddingCat(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-md transition-colors">
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const subs = subcategories.filter((s) => s.parentCategoryId === cat.id);
          const isAddingSubToThis = isAddingSub === cat.id;

          return (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {cat.name} ({cat.nameHi})
                    </h3>
                    <div className="text-[11px] text-emerald-400 font-mono">/category/{cat.slug}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateCategory(cat.id, { isActive: !cat.isActive })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                        cat.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Districts) list */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Subcategories & Districts ({subs.length}):</span>
                    {!isAddingSubToThis && (
                      <button
                        onClick={() => setIsAddingSub(cat.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add District</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {subs.map((s) => (
                      <span
                        key={s.id}
                        className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border border-slate-800"
                      >
                        <MapPin className="w-3 h-3 text-red-400" />
                        <span>{s.name} ({s.nameHi})</span>
                        <button
                          onClick={() => onDeleteSubcategory(s.id)}
                          className="text-slate-500 hover:text-rose-400 ml-1 text-sm leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subcategory Add Inline Form */}
                {isAddingSubToThis && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-2">
                    <div className="text-xs font-bold text-slate-300">Add New District / Subcategory</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Hindi Name (e.g. कैथल)"
                        value={subNameHi}
                        onChange={(e) => {
                          setSubNameHi(e.target.value);
                          if (!subSlug) setSubSlug(generateSlug(e.target.value));
                        }}
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="English Name (Kaithal)"
                        value={subNameEn}
                        onChange={(e) => {
                          setSubNameEn(e.target.value);
                          if (!subSlug) setSubSlug(generateSlug(e.target.value));
                        }}
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingSub(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSubcategory(cat.id, cat.nameHi)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
