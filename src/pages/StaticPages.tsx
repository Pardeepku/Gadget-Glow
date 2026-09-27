import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { dbService } from '../services/db';
import { Mail, Phone, MapPin, Send, CheckCircle, Shield, FileText, Info, AlertTriangle, ChevronRight } from 'lucide-react';

export type StaticPageType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'editorial-policy';

export interface StaticPagesProps {
  pageType: StaticPageType | string;
  siteSettings?: SiteSettings;
  onNavigate?: (path: string) => void;
  onNavigateHome?: () => void;
  onSelectPage?: (page: StaticPageType | string) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({
  pageType,
  siteSettings: initialSettings,
  onNavigate,
  onNavigateHome,
  onSelectPage,
}) => {
  const siteSettings = initialSettings || dbService.getSiteSettings();
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) return;
    try {
      await dbService.sendContactMessage({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        subject: formSubject.trim() || 'वेबसाइट पूछताछ',
        message: formMessage.trim(),
      });
      setSent(true);
    } catch (err) {
      console.error('Failed to submit contact message to Firestore:', err);
      setSent(true);
    }
  };

  const navHome = () => {
    if (onNavigateHome) onNavigateHome();
    else if (onNavigate) onNavigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <button onClick={navHome} className="hover:text-red-600">
          होम
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">
          {pageType === 'about' && 'हमारे बारे में (About Us)'}
          {pageType === 'contact' && 'संपर्क करें (Contact Us)'}
          {pageType === 'privacy' && 'गोपनीयता नीति (Privacy Policy)'}
          {pageType === 'terms' && 'नियम और शर्तें (Terms & Conditions)'}
          {pageType === 'disclaimer' && 'अस्वीकरण (Disclaimer)'}
          {pageType === 'editorial-policy' && 'संपादकीय नीति (Editorial Policy)'}
        </span>
      </nav>

      {/* 1. ABOUT US PAGE */}
      {(pageType === 'about' || pageType === 'editorial-policy') && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <Info className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900">
                गैजेट ग्लो के बारे में
              </h1>
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">
                गैजेट, टेक और डिजिटल दुनिया की हर खबर • 24x7 लाइव
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              <strong>गैजेट ग्लो (Gadget Glow)</strong> भारत का एक अग्रणी, निष्पक्ष और आधुनिक डिजिटल न्यूज़ एवं टेक पोर्टल है। हमारा प्रमुख ध्येय टेक्नोलॉजी, गैजेट्स, स्मार्टफोन्स, एआई, ऑटोमोबाइल के साथ-साथ देश, हरियाणा, दिल्ली-एनसीआर, सभी राज्यों एवं वैश्विक परिदृश्य की सबसे सटीक, निष्पक्ष और त्वरित खबरें पाठकों तक पहुंचाना है।
            </p>

            <h3 className="font-serif font-bold text-lg text-slate-900 mt-6">हमारा मिशन (Our Mission)</h3>
            <p>
              हम लोकतांत्रिक मूल्यों, जनहित के मुद्दों, सामाजिक न्याय और निष्पक्ष पत्रकारिता के प्रति पूर्ण रूप से समर्पित हैं। आधुनिक डिजिटल तकनीकों का उपयोग करते हुए हम बिना किसी राजनीतिक या व्यावसायिक दबाव के सत्य को सामने लाते हैं।
            </p>

            <h3 className="font-serif font-bold text-lg text-slate-900 mt-6">संपादकीय मूल्य (Editorial Ethics)</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>सटीकता एवं सत्यापन:</strong> हर खबर प्रकाशित करने से पहले ग्राउंड सोर्सेज से शत-प्रतिशत पुष्टि की जाती है।</li>
              <li><strong>तटस्थता:</strong> किसी भी पक्षपात के बिना केवल तथ्यों को प्राथमिकता दी जाती है।</li>
              <li><strong>स्थानीय पत्रकारिता:</strong> ग्राउंड लेवल के संवाददाताओं के विशाल नेटवर्क द्वारा गांव, कस्बों और जिला मुख्यालयों की आवाज को मंच प्रदान करना।</li>
            </ul>

            <div className="bg-slate-50 border-l-4 border-red-600 p-4 rounded-r mt-6">
              <h4 className="font-bold text-slate-900 text-sm">प्रधान कार्यालय (Editorial Bureau):</h4>
              <p className="text-xs text-slate-600 mt-1">{siteSettings.address}</p>
              <p className="text-xs text-slate-600">ईमेल: {siteSettings.contactEmail} | फोन: {siteSettings.phone}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTACT US PAGE */}
      {pageType === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Info Card (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="font-serif font-black text-2xl text-white mb-2">संपर्क करें</h1>
              <p className="text-xs text-slate-300">
                समाचार सुझाव, संपादकीय पूछताछ, विज्ञापन या प्रतिक्रिया के लिए हमसे संपर्क करें।
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <strong className="text-white block">कार्यालय का पता:</strong>
                  <span>{siteSettings.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <strong className="text-white block">फोन नंबर:</strong>
                  <span>{siteSettings.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <strong className="text-white block">संपादकीय ईमेल:</strong>
                  <span>{siteSettings.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <strong className="text-xs text-amber-400 block mb-1">विज्ञापन संपर्क:</strong>
              <p className="text-xs text-slate-400">advt@gadgetglow.com</p>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif font-bold text-xl text-slate-900 mb-4">संदेश भेजें</h2>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base">संदेश सफलतापूर्वक भेजा गया!</h3>
                <p className="text-xs">हमारी संपादकीय टीम शीघ्र ही आपसे संपर्क करेगी। धन्यवाद।</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">आपका नाम (Full Name)*</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ईमेल (Email Address)*</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">मोबाइल नंबर (Phone)</label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">विषय (Subject)*</label>
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="खबर संबंधी सुझाव / विज्ञापन / प्रतिक्रिया"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">संदेश (Message)*</label>
                  <textarea
                    required
                    rows={4}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="अपना संदेश विस्तार से लिखें..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-neutral-200 rounded focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  संदेश भेजें
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. PRIVACY POLICY */}
      {pageType === 'privacy' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900">
                गोपनीयता नीति (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-500">अंतिम अपडेट: 23 अगस्त 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p>
              गैजेट ग्लो ("हम", "हमारा" या "पोर्टल") आपके व्यक्तिगत डेटा और गोपनीयता की रक्षा करने के लिए प्रतिबद्ध है। यह नीति बताती है कि जब आप हमारी वेबसाइट का उपयोग करते हैं तो हम आपकी जानकारी को कैसे एकत्र, उपयोग और सुरक्षित करते हैं।
            </p>
            <h3 className="font-bold text-slate-900 text-base">1. हम कौन सी जानकारी एकत्र करते हैं</h3>
            <p>जब आप न्यूज़लेटर सब्सक्राइब करते हैं, टिप्पणी करते हैं या संपर्क फ़ॉर्म भरते हैं, तो हम आपका नाम, ईमेल पता और संदेश एकत्र कर सकते हैं। इसके अतिरिक्त कुकीज़ और एनालिटिक्स टूल्स के माध्यम से गैर-व्यक्तिगत ट्रैफ़िक डेटा एकत्र होता है।</p>

            <h3 className="font-bold text-slate-900 text-base">2. जानकारी का उपयोग</h3>
            <p>हम एकत्र की गई जानकारी का उपयोग पाठकों को बेहतर समाचार अनुभव देने, न्यूज़लेटर भेजने, तकनीकी समस्याओं का निवारण करने और धोखाधड़ी रोकने के लिए करते हैं।</p>

            <h3 className="font-bold text-slate-900 text-base">3. डेटा सुरक्षा</h3>
            <p>हम आपके डेटा की सुरक्षा के लिए अत्याधुनिक एन्क्रिप्शन और सुरक्षा प्रोटोकॉल का पालन करते हैं। हम आपका व्यक्तिगत डेटा किसी तीसरे पक्ष को बेचते या साझा नहीं करते हैं।</p>
          </div>
        </div>
      )}

      {/* 4. TERMS & CONDITIONS */}
      {pageType === 'terms' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <FileText className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900">
                नियम और शर्तें (Terms & Conditions)
              </h1>
              <p className="text-xs text-slate-500">अंतिम अपडेट: 23 अगस्त 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p>
              गैजेट ग्लो की वेबसाइट पर आने और इसकी सामग्री का उपयोग करने से आप निम्नलिखित नियमों और शर्तों के लिए अपनी सहमति प्रदान करते हैं।
            </p>
            <h3 className="font-bold text-slate-900 text-base">1. कॉपीराइट एवं बौद्धिक संपदा</h3>
            <p>गैजेट ग्लो पर प्रकाशित सभी समाचार, लेख, तस्वीरें, वीडियो और ग्राफिक्स गैजेट ग्लो की बौद्धिक संपदा हैं। पूर्व लिखित अनुमति के बिना इन्हें व्यावसायिक रूप से कॉपी करना प्रतिबंधित है।</p>

            <h3 className="font-bold text-slate-900 text-base">2. पाठक टिप्पणियां एवं आचार संहिता</h3>
            <p>पाठकों से अपेक्षा की जाती है कि वे शालीन भाषा का उपयोग करें। किसी भी प्रकार की अभद्र, सांप्रदायिक, मानहानिकारक या गैरकानूनी टिप्पणी को बिना सूचना के हटाने का अधिकार संपादकीय टीम के पास सुरक्षित है।</p>
          </div>
        </div>
      )}

      {/* 5. DISCLAIMER */}
      {pageType === 'disclaimer' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-slate-900">
                अस्वीकरण (Disclaimer)
              </h1>
              <p className="text-xs text-slate-500">संपादकीय एवं विधिक सूचना</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p>
              गैजेट ग्लो पर प्रकाशित समाचार और विचार केवल जन-जागरूकता और सूचना के उद्देश्य से हैं। हम समाचारों की सत्यता सुनिश्चित करने के लिए हर संभव प्रयास करते हैं, फिर भी किसी अनजाने विसंगति के लिए कानूनी दायित्व अस्वीकार करते हैं।
            </p>
            <p>
              लेखकों और विचार स्तंभकारों द्वारा व्यक्त किए गए विचार उनके निजी विचार हैं और आवश्यक नहीं कि गैजेट ग्लो प्रबंधन उनसे सहमत हो।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const StaticPage = StaticPages;
