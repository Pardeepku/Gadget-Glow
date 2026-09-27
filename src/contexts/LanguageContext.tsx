import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  googleCode: string;
  scriptDirection?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', googleCode: 'hi' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', googleCode: 'en' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', googleCode: 'pa' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', googleCode: 'bn' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', googleCode: 'mr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', googleCode: 'gu' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', googleCode: 'te' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', googleCode: 'ta' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', googleCode: 'kn' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', googleCode: 'ml' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', googleCode: 'or' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', googleCode: 'ur', scriptDirection: 'rtl' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', googleCode: 'as' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳', googleCode: 'bho' },
  { code: 'hri', name: 'Haryanvi', nativeName: 'हरियाणवी', flag: '🇮🇳', googleCode: 'hi' }, // uses Hindi engine
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳', googleCode: 'sa' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', googleCode: 'ne' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇮🇳', googleCode: 'sd', scriptDirection: 'rtl' },
];

// Rapid UI dictionary for core navigation and phrases
const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    breakingNews: 'Breaking News',
    latestNews: 'Latest News',
    epaper: 'E-Paper',
    videos: 'Videos',
    photos: 'Photos',
    liveBulletin: 'Live Bulletin',
    search: 'Search',
    searchPlaceholder: 'Search news, districts or topics...',
    adminPanel: 'CMS / Admin',
    contactUs: 'Contact Us',
    readMore: 'Read Full Story',
    publishedOn: 'Published',
    author: 'Author',
    trending: 'Trending Topics',
    haryanaNews: 'Haryana & District News',
    politicsCrime: 'Politics & Crime',
    selectLanguage: 'Select Language',
    allIndiaLanguages: 'All Indian Languages & English',
  },
  pa: {
    home: 'ਮੁੱਖ ਪੰਨਾ',
    breakingNews: 'ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ',
    latestNews: 'ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ',
    epaper: 'ਈ-ਪੇਪਰ',
    videos: 'ਵੀਡੀਓਜ਼',
    photos: 'ਤਸਵੀਰਾਂ',
    liveBulletin: 'ਲਾਈਵ ਬੁਲੇਟਿਨ',
    search: 'ਖੋਜੋ',
    searchPlaceholder: 'ਖ਼ਬਰਾਂ, ਜ਼ਿਲ੍ਹਾ ਜਾਂ ਵਿਸ਼ਾ ਖੋਜੋ...',
    adminPanel: 'ਸੀਐਮਐਸ / ਐਡਮਿਨ',
    contactUs: 'ਸੰਪਰਕ ਕਰੋ',
    readMore: 'ਪੂਰੀ ਖ਼ਬਰ ਪੜ੍ਹੋ',
    publishedOn: 'ਪ੍ਰਕਾਸ਼ਿਤ',
    author: 'ਲੇਖਕ',
    trending: 'ਚਰਚਿਤ ਖ਼ਬਰਾਂ',
    haryanaNews: 'ਹਰਿਆਣਾ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਖ਼ਬਰਾਂ',
    politicsCrime: 'ਰਾਜਨੀਤੀ ਅਤੇ ਅਪਰਾਧ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    allIndiaLanguages: 'ਸਾਰੀਆਂ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਅਤੇ ਅੰਗਰੇਜ਼ੀ',
  },
  bn: {
    home: 'প্রচ্ছদ',
    breakingNews: 'তাজা খবর',
    latestNews: 'সর্বশেষ খবর',
    epaper: 'ই-পেপার',
    videos: 'ভিডিও',
    photos: 'ছবি',
    liveBulletin: 'লাইভ বুলেটিন',
    search: 'অনুসন্ধান',
    searchPlaceholder: 'সংবাদ বা বিষয় খুঁজুন...',
    adminPanel: 'সিএমএস / অ্যাডমিন',
    contactUs: 'যোগাযোগ',
    readMore: 'সম্পূর্ণ খবর পড়ুন',
    publishedOn: 'প্রকাশিত',
    author: 'লেখক',
    trending: 'জনপ্রিয় খবর',
    haryanaNews: 'হরিয়ানা ও জেলা সংবাদ',
    politicsCrime: 'রাজনীতি ও অপরাধ',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    allIndiaLanguages: 'সমস্ত ভারতীয় ভাষা ও ইংরেজি',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    breakingNews: 'ताजी बातमी',
    latestNews: 'ताज्या बातम्या',
    epaper: 'ई-पेपर',
    videos: 'व्हिडीओ',
    photos: 'फोटो',
    liveBulletin: 'थेट बुलेटिन',
    search: 'शोधा',
    searchPlaceholder: 'बातम्या, जिल्हा किंवा विषय शोधा...',
    adminPanel: 'सीएमएस / ॲडमिन',
    contactUs: 'संपर्क साधा',
    readMore: 'पूर्ण बातमी वाचा',
    publishedOn: 'प्रकाशित',
    author: 'लेखक',
    trending: 'ट्रेंडिंग बातम्या',
    haryanaNews: 'हरियाणा व जिल्हा विशेष',
    politicsCrime: 'राजकारण व गुन्हेगारी',
    selectLanguage: 'भाषा निवडा',
    allIndiaLanguages: 'सर्व भारतीय भाषा आणि इंग्रजी',
  },
  gu: {
    home: 'મુખ્ય પૃષ્ઠ',
    breakingNews: 'તાજા સમાચાર',
    latestNews: 'તાજા સમાચાર',
    epaper: 'ઈ-પેપર',
    videos: 'વીડિયો',
    photos: 'ફોટોઝ',
    liveBulletin: 'લાઈવ બુલેટિન',
    search: 'શોધો',
    searchPlaceholder: 'સમાચાર, જિલ્લો કે વિષય શોધો...',
    adminPanel: 'સીએમએસ / એડમિન',
    contactUs: 'સંપર્ક કરો',
    readMore: 'સંપૂર્ણ સમાચાર વાંચો',
    publishedOn: 'પ્રકાશિત',
    author: 'લેખક',
    trending: 'ટ્રેન્ડિંગ સમાચાર',
    haryanaNews: 'હરિયાણા અને જિલ્લા સમાચાર',
    politicsCrime: 'રાજકારણ અને ગુના',
    selectLanguage: 'ભાષા પસંદ કરો',
    allIndiaLanguages: 'તમામ ભારતીય ભાષાઓ અને અંગ્રેજી',
  },
  te: {
    home: 'హోమ్',
    breakingNews: 'బ్రేకింగ్ న్యూస్',
    latestNews: 'తాజా వార్తలు',
    epaper: 'ఈ-పేపర్',
    videos: 'వీడియోలు',
    photos: 'ఫోటోలు',
    liveBulletin: 'లైవ్ బులెటిన్',
    search: 'శోధించండి',
    searchPlaceholder: 'వార్తలు లేదా అంశాలు శోధించండి...',
    adminPanel: 'సిఎంఎస్ / అడ్మిన్',
    contactUs: 'సంప్రదించండి',
    readMore: 'పూర్తి వార్త చదవండి',
    publishedOn: 'ప్రచురితం',
    author: 'రచయిత',
    trending: 'ట్రెండింగ్ వార్తలు',
    haryanaNews: 'హర్యానా & జిల్లా వార్తలు',
    politicsCrime: 'రాజకీయాలు & నేరాలు',
    selectLanguage: 'భాషను ఎంచుకోండి',
    allIndiaLanguages: 'అన్ని భారతీయ భాషలు & ఇంగ్లీష్',
  },
  ta: {
    home: 'முகப்பு',
    breakingNews: 'முக்கியச் செய்திகள்',
    latestNews: 'சமீபத்திய செய்திகள்',
    epaper: 'இ-பேப்பர்',
    videos: 'வீடியோக்கள்',
    photos: 'புகைப்படங்கள்',
    liveBulletin: 'நேரலை செய்தி',
    search: 'தேடுக',
    searchPlaceholder: 'செய்திகள் அல்லது தலைப்புகளைத் தேடுங்கள்...',
    adminPanel: 'சிஎம்எஸ் / நிர்வாகம்',
    contactUs: 'தொடர்புகொள்ள',
    readMore: 'முழு செய்தி படிக்க',
    publishedOn: 'வெளியிடப்பட்டது',
    author: 'ஆசிரியர்',
    trending: 'டிரெண்டிங் செய்திகள்',
    haryanaNews: 'ஹரியானா & மாவட்ட செய்திகள்',
    politicsCrime: 'அரசியல் & குற்றங்கள்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    allIndiaLanguages: 'அனைத்து இந்திய மொழிகள் & ஆங்கிலம்',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    breakingNews: 'ತಾಜಾ ಸುದ್ದಿ',
    latestNews: 'ಇತ್ತೀಚಿನ ಸುದ್ದಿ',
    epaper: 'ಇ-ಪೇಪರ್',
    videos: 'ವೀಡಿಯೊಗಳು',
    photos: 'ಫೋಟೋಗಳು',
    liveBulletin: 'ಲೈವ್ ಬುಲೆಟಿನ್',
    search: 'ಹುಡುಕಿ',
    searchPlaceholder: 'ಸುದ್ದಿ ಅಥವಾ ವಿಷಯಗಳನ್ನು ಹುಡುಕಿ...',
    adminPanel: 'ಸಿಎಂಎಸ್ / ನಿರ್ವಾಹಕ',
    contactUs: 'ಸಂಪರ್ಕಿಸಿ',
    readMore: 'ಸಂಪೂರ್ಣ ಸುದ್ದಿ ಓದಿ',
    publishedOn: 'ಪ್ರಕಟಿಸಲಾಗಿದೆ',
    author: 'ಲೇಖಕ',
    trending: 'ಟ್ರೆಂಡಿಂಗ್ ಸುದ್ದಿ',
    haryanaNews: 'ಹರಿಯಾಣ ಮತ್ತು ಜಿಲ್ಲಾ ಸುದ್ದಿ',
    politicsCrime: 'ರಾಜಕೀಯ ಮತ್ತು ಅಪರಾಧ',
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    allIndiaLanguages: 'ಎಲ್ಲಾ ಭಾರತೀಯ ಭಾಷೆಗಳು ಮತ್ತು ಇಂಗ್ಲಿಷ್',
  },
  ml: {
    home: 'പ്രധാന പേജ്',
    breakingNews: 'ബ്രേക്കിംഗ് ന്യൂസ്',
    latestNews: 'ഏറ്റവും പുതിയ വാർത്തകൾ',
    epaper: 'ഇ-പേപ്പർ',
    videos: 'വീഡിയോകൾ',
    photos: 'ചിത്രങ്ങൾ',
    liveBulletin: 'തത്സമയ ബുള്ളറ്റിൻ',
    search: 'തിരയുക',
    searchPlaceholder: 'വാർത്തകൾ അല്ലെങ്കിൽ വിഷയങ്ങൾ തിരയുക...',
    adminPanel: 'സിഎംഎസ് / അഡ്മിൻ',
    contactUs: 'ബന്ധപ്പെടുക',
    readMore: 'പൂർണ്ണ വാർത്ത വായിക്കുക',
    publishedOn: 'പ്രസിദ്ധീകരിച്ചത്',
    author: 'ലേഖകൻ',
    trending: 'ട്രെൻഡിംഗ് വാർത്തകൾ',
    haryanaNews: 'ഹരിയാന & ജില്ലാ വാർത്തകൾ',
    politicsCrime: 'രാഷ്ട്രീയവും കുറ്റകൃത്യങ്ങളും',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    allIndiaLanguages: 'എല്ലാ ഇന്ത്യൻ ഭാഷകളും ഇംഗ്ലീഷും',
  },
  or: {
    home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    breakingNews: 'ତାଜା ଖବର',
    latestNews: 'ନୂତନ ଖବର',
    epaper: 'ଇ-ପେପର',
    videos: 'ଭିଡିଓ',
    photos: 'ଫଟୋ',
    liveBulletin: 'ଲାଇଭ ବୁଲେଟିନ',
    search: 'ଖୋଜନ୍ତୁ',
    searchPlaceholder: 'ଖବର କିମ୍ବା ବିଷୟ ଖୋଜନ୍ତୁ...',
    adminPanel: 'ସିଏମଏସ / ଆଡମିନ',
    contactUs: 'ଯୋଗାଯୋଗ କରନ୍ତୁ',
    readMore: 'ପୂରା ଖବର ପଢ଼ନ୍ତୁ',
    publishedOn: 'ପ୍ରକାଶିତ',
    author: 'ଲେଖକ',
    trending: 'ଟ୍ରେଣ୍ଡିଂ ଖବର',
    haryanaNews: 'ହରିୟାଣା ଏବଂ ଜିଲ୍ଲା ଖବର',
    politicsCrime: 'ରାଜନୀତି ଏବଂ ଅପରାଧ',
    selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    allIndiaLanguages: 'ସମସ୍ତ ଭାରତୀୟ ଭାଷା ଏବଂ ଇଂରାଜୀ',
  },
  ur: {
    home: 'ہوم پیج',
    breakingNews: 'تازہ ترین خبریں',
    latestNews: 'تازہ ترین خبریں',
    epaper: 'ای پیپر',
    videos: 'ویڈیوز',
    photos: 'تصاویر',
    liveBulletin: 'لائیو بلیٹن',
    search: 'تلاش کریں',
    searchPlaceholder: 'خبریں، ضلع یا موضوع تلاش کریں...',
    adminPanel: 'سی ایم ایس / ایڈمن',
    contactUs: 'ہم سے رابطہ کریں',
    readMore: 'مکمل خبر پڑھیں',
    publishedOn: 'شائع ہوا',
    author: 'مصنف',
    trending: 'ٹرینڈنگ خبریں',
    haryanaNews: 'ہریانہ اور ضلعی خبریں',
    politicsCrime: 'سیاست اور جرائم',
    selectLanguage: 'زبان منتخب کریں',
    allIndiaLanguages: 'تمام ہندوستانی زبانیں اور انگریزی',
  },
  bho: {
    home: 'मुख्य पन्ना',
    breakingNews: 'ताजा खबरिया',
    latestNews: 'ताजा खबर',
    epaper: 'ई-अखबार',
    videos: 'वीडियो',
    photos: 'फोटो',
    liveBulletin: 'लाइव बुलेटिन',
    search: 'खोजीं',
    searchPlaceholder: 'खबर या विषय खोजीं...',
    adminPanel: 'सीएमएस / एडमिन',
    contactUs: 'सम्पर्क करीं',
    readMore: 'पूरा खबर पढ़ीं',
    publishedOn: 'प्रकाशित',
    author: 'लेखक',
    trending: 'चर्चा में खबर',
    haryanaNews: 'हरियाणा आ जिला खबर',
    politicsCrime: 'राजनीति आ अपराध',
    selectLanguage: 'भाषा चुनीं',
    allIndiaLanguages: 'सब भारतीय भाषा आ अंग्रेजी',
  },
  hri: {
    home: 'मुख्य पेज',
    breakingNews: 'तात्ता तात्ता खबर',
    latestNews: 'ताजा समाचार',
    epaper: 'ई-कागद (E-Paper)',
    videos: 'वीडियो',
    photos: 'फोटो',
    liveBulletin: 'लाइव बुलेटिन',
    search: 'टोवणा (Search)',
    searchPlaceholder: 'खबर या जिला टोहें...',
    adminPanel: 'सीएमएस / एडमिन',
    contactUs: 'राब्ता करणा (Contact)',
    readMore: 'पूरी खबर पढ़ो',
    publishedOn: 'तारीख',
    author: 'लिखण आला',
    trending: 'घणी चलण आली खबर',
    haryanaNews: 'हरियाणा अर ज़िला समाचार',
    politicsCrime: 'राजनीति अर जुर्म',
    selectLanguage: 'बोली चुणो',
    allIndiaLanguages: 'सारी देसी भाषा अर अंग्रेज़ी',
  },
  sa: {
    home: 'मुख्यपृष्ठम्',
    breakingNews: 'सद्यः वार्ता',
    latestNews: 'नवीनवार्ताः',
    epaper: 'ई-वार्तापत्रम्',
    videos: 'दृश्यश्रव्यम्',
    photos: 'चित्राणि',
    liveBulletin: 'प्रत्यक्षवार्ता',
    search: 'अन्वेषणम्',
    searchPlaceholder: 'वार्ताम् अन्विषन्तु...',
    adminPanel: 'प्रशासनम्',
    contactUs: 'सम्पर्कः',
    readMore: 'सम्पूर्णं पठन्तु',
    publishedOn: 'प्रकाशितम्',
    author: 'लेखकः',
    trending: 'प्रसिद्धाः वार्ताः',
    haryanaNews: 'हरियाणा मण्डलवार्ताः',
    politicsCrime: 'राजनीतिः अपराधश्च',
    selectLanguage: 'भाषां चिनुत',
    allIndiaLanguages: 'सर्वाः भारतीयभाषाः आङ्ग्लभाषा च',
  },
};

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (code: string) => void;
  languages: Language[];
  t: (key: string, defaultText?: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('samachar_language');
    return SUPPORTED_LANGUAGES.find((l) => l.code === saved) || SUPPORTED_LANGUAGES[0];
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize Google Translate script
  useEffect(() => {
    // Add Google Translate element container if not exists
    let gtDiv = document.getElementById('google_translate_element');
    if (!gtDiv) {
      gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      document.body.appendChild(gtDiv);
    }

    // Add global init function
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'hi',
            includedLanguages: 'hi,en,pa,bn,mr,gu,te,ta,kn,ml,or,ur,as,ne,sd,sa',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const triggerGoogleTranslation = (targetGoogleCode: string) => {
    setIsTranslating(true);
    try {
      // Set the googtrans cookie for domain
      const host = window.location.hostname;
      const cookieValue = `/hi/${targetGoogleCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; domain=.${host}; path=/;`;

      // Trigger the select dropdown inside Google Translate widget if present
      const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElem) {
        selectElem.value = targetGoogleCode;
        selectElem.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google translate trigger notification:', e);
    } finally {
      setTimeout(() => setIsTranslating(false), 800);
    }
  };

  const changeLanguage = (code: string) => {
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
    setCurrentLanguage(selected);
    localStorage.setItem('samachar_language', selected.code);

    // Apply text direction for RTL languages like Urdu/Sindhi
    if (selected.scriptDirection === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }

    document.documentElement.setAttribute('lang', selected.code);

    // Trigger full page translation
    triggerGoogleTranslation(selected.googleCode);
  };

  const t = (key: string, defaultText: string = ''): string => {
    if (currentLanguage.code === 'hi') return defaultText;
    const langDict = UI_TRANSLATIONS[currentLanguage.code];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return defaultText;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
