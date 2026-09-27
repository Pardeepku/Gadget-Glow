import React, { useState } from 'react';
import { Author } from '../../types';
import { Users, Plus, Edit2, Trash2, MapPin, Mail, UserCheck, X, Save } from 'lucide-react';
import { generateSlug } from '../../utils/slugify';

interface AuthorManagerProps {
  authors: Author[];
  onAddAuthor: (author: Omit<Author, 'id'>) => Promise<void>;
  onUpdateAuthor: (id: string, author: Partial<Author>) => Promise<void>;
  onDeleteAuthor: (id: string) => Promise<void>;
}

export const AuthorManager: React.FC<AuthorManagerProps> = ({
  authors,
  onAddAuthor,
  onUpdateAuthor,
  onDeleteAuthor,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      await onUpdateAuthor(editingId, {
        name: name.trim(),
        designation: designation.trim(),
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        photo: photo.trim() || undefined,
      });
      setEditingId(null);
    } else {
      await onAddAuthor({
        name: name.trim(),
        slug: generateSlug(name.trim()),
        designation: designation.trim() || 'Reporter',
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        photo: photo.trim() || undefined,
        isActive: true,
      });
      setIsAdding(false);
    }

    setName('');
    setDesignation('');
    setEmail('');
    setBio('');
    setLocation('');
    setPhoto('');
  };

  const startEdit = (author: Author) => {
    setEditingId(author.id);
    setName(author.name);
    setDesignation(author.designation || '');
    setEmail(author.email || '');
    setBio(author.bio || '');
    setLocation(author.location || '');
    setPhoto(author.photo || author.photoURL || '');
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Editorial Team & Reporters
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage bureau chiefs, senior editors, and district correspondents
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setEditingId(null);
              setIsAdding(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reporter / Author</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-sm text-white">
              {editingId ? 'Edit Author Profile' : 'Add New Editorial Member'}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rajesh Sharma"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Designation / Role *</label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Chief Bureau / Senior Editor / Reporter"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location / District</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Chandigarh / Panipat / New Delhi"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reporter@gadgetglow.com"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Profile Photo URL</label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Bio / Journalist Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Journalistic background, areas of expertise, beats covered..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
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
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-md transition-colors">
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Authors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {authors.map((auth) => (
          <div
            key={auth.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={auth.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={auth.name}
                  className="w-14 h-14 rounded-full object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{auth.name}</h3>
                  <div className="text-[11px] text-emerald-400 font-medium">{auth.designation}</div>
                  {auth.location && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{auth.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{auth.bio || 'Journalist and contributor at Gadget Glow.'}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{auth.email}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(auth)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove author ${auth.name}?`)) {
                      onDeleteAuthor(auth.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
