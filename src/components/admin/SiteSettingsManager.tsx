import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { Settings, Save, CheckCircle, Mail, Phone, MapPin, Share2 } from 'lucide-react';

interface SiteSettingsManagerProps {
  siteSettings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}

export const SiteSettingsManager: React.FC<SiteSettingsManagerProps> = ({ siteSettings, onSave }) => {
  const [websiteName, setWebsiteName] = useState(siteSettings.websiteName);
  const [tagline, setTagline] = useState(siteSettings.tagline);
  const [contactEmail, setContactEmail] = useState(siteSettings.contactEmail);
  const [phone, setPhone] = useState(siteSettings.phone);
  const [address, setAddress] = useState(siteSettings.address);
  const [copyrightText, setCopyrightText] = useState(siteSettings.copyrightText);

  // Socials
  const [facebook, setFacebook] = useState(siteSettings.socialLinks.facebook || '');
  const [twitter, setTwitter] = useState(siteSettings.socialLinks.twitter || '');
  const [youtube, setYoutube] = useState(siteSettings.socialLinks.youtube || '');
  const [instagram, setInstagram] = useState(siteSettings.socialLinks.instagram || '');
  const [telegram, setTelegram] = useState(siteSettings.socialLinks.telegram || '');
  const [whatsapp, setWhatsapp] = useState(siteSettings.socialLinks.whatsapp || '');

  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      websiteName: websiteName.trim(),
      tagline: tagline.trim(),
      contactEmail: contactEmail.trim(),
      phone: phone.trim(),
      address: address.trim(),
      copyrightText: copyrightText.trim(),
      socialLinks: {
        facebook: facebook.trim(),
        twitter: twitter.trim(),
        youtube: youtube.trim(),
        instagram: instagram.trim(),
        telegram: telegram.trim(),
        whatsapp: whatsapp.trim(),
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-500" />
            Website Settings & Branding
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure site identity, slogan, contact information, and official social media channels
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Contact */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white border-b border-slate-800 pb-3">
            Brand Identity & General Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Website Portal Name *</label>
              <input
                type="text"
                required
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tagline / Mission Statement *</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-red-400 font-medium rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Editorial Contact Email *</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Headquarters / Bureau Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Footer Copyright Notice</label>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            Official Social Media Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Twitter / 𝕏 Profile URL</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube Channel URL</label>
              <input
                type="url"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Instagram Handle URL</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Channel Link</label>
              <input
                type="url"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Telegram Channel Link</label>
              <input
                type="url"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Settings saved successfully!
            </div>
          )}
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg ml-auto transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
