import { UserProfile, UserRole } from '../types';

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  designation: string;
  bio: string;
  location: string;
  photoURL: string;
  badge: string;
  badgeColor: string;
  permissionsDescription: string;
  allowedFeatures: string[];
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'user-superadmin',
    name: 'प्रदीप सैनी (Pradeep Saini)',
    email: 'superadmin@gadgetglow.com',
    password: 'SuperAdmin@2026',
    role: 'super_admin',
    designation: 'प्रधान संपादक (Editor-in-Chief & Super Admin)',
    bio: 'गैजेट ग्लो (Gadget Glow) के संस्थापक एवं प्रधान संपादक। समस्त पोर्टल, डेटाबेस, यूजर्स व संपादकीय नीति का पूर्ण नियंत्रण।',
    location: 'चंडीगढ़ / नई दिल्ली',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    badge: 'सुपर एडमिन (Super Admin)',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    permissionsDescription: 'सर्वोच्च अधिकार: समस्त समाचार, श्रेणियां, विज्ञापन, ई-पेपर, साइट सेटिंग्स, यूजर प्रबंधन, SEO व एक्टिविटी लॉग्स।',
    allowedFeatures: ['पूर्ण CMS नियंत्रण', 'यूजर रोल प्रबंधन', 'सिस्टम सेटिंग्स', 'SEO & साइटमैप', 'विज्ञापन अनुबंध'],
  },
  {
    id: 'user-admin',
    name: 'राजेश कुमार (Rajesh Kumar)',
    email: 'admin@gadgetglow.com',
    password: 'Admin@2026',
    role: 'admin',
    designation: 'मुख्य प्रशासक (Chief Administrator & General Manager)',
    bio: 'पोर्टल संचालन, विज्ञापन अनुबंध, तकनीकी सेटिंग्स और स्टाफ प्रबंधन के मुख्य प्रभारी।',
    location: 'गुरुग्राम, हरियाणा',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    badge: 'एडमिन (Admin)',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    permissionsDescription: 'प्रशासनिक अधिकार: विज्ञापन प्रबंधन, श्रेणी व जिले, साइट सेटिंग्स, स्टाफ मॉनिटरिंग और प्रकाशित लेख।',
    allowedFeatures: ['विज्ञापन स्लॉट्स', 'श्रेणी प्रबंधन', 'वेबसाइट सेटिंग्स', 'न्यूज़ पब्लिशिंग', 'स्टाफ मॉनिटरिंग'],
  },
  {
    id: 'user-editor',
    name: 'अमित भारद्वाज (Amit Bhardwaj)',
    email: 'editor@gadgetglow.com',
    password: 'Editor@2026',
    role: 'editor',
    designation: 'वरिष्ठ उप-संपादक (Senior Desk Editor & Content Head)',
    bio: '10 वर्षों का पत्रकारिता अनुभव। ग्राउंड रिपोर्टिंग का संपादन, ब्रेकिंग न्यूज मॉनिटरिंग और फैक्ट-चेक प्रमुख।',
    location: 'करनाल, हरियाणा',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    badge: 'संपादक (Editor)',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    permissionsDescription: 'संपादकीय अधिकार: रिपोर्टर लेखों की समीक्षा व पब्लिश, ब्रेकिंग न्यूज टिकर, वीडियो बुलेटिन व ई-पेपर।',
    allowedFeatures: ['लेख समीक्षा व पब्लिश', 'ब्रेकिंग न्यूज अलर्ट', 'वीडियो बुलेटिन', 'ई-पेपर प्रकाशन', 'AI ऑटो-फेच'],
  },
  {
    id: 'user-reporter',
    name: 'पूजा शर्मा (Pooja Sharma)',
    email: 'reporter@gadgetglow.com',
    password: 'Reporter@2026',
    role: 'reporter',
    designation: 'विशेष संवाददाता - हरियाणा ब्यूरो (Special Correspondent)',
    bio: 'पानीपत, करनाल और सोनीपत से राजनीति, सामाजिक सरोकारों व अपराध पर सटीक व त्वरित ग्राउंड कवरेज।',
    location: 'पानीपत, हरियाणा',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    badge: 'संवाददाता (Reporter)',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    permissionsDescription: 'रिपोर्टिंग अधिकार: नए लेख लिखना, ग्राउंड फोटोज अपलोड करना, वीडियो व ड्राफ्ट सबमिट करना।',
    allowedFeatures: ['नए लेख तैयार करना', 'ड्राफ्ट सबमिशन', 'फील्ड फोटो अपलोड', 'रिपोर्टर प्रोफाइल'],
  },
  {
    id: 'user-moderator',
    name: 'राहुल वर्मा (Rahul Verma)',
    email: 'user@gadgetglow.com',
    password: 'User@2026',
    role: 'moderator',
    designation: 'कम्युनिटी मॉडरेटर व पाठक प्रतिनिधि (Community Moderator & User)',
    bio: 'पाठकों की टिप्पणियों का सत्यापन, स्पैम फिल्टरिंग, सार्वजनिक संदेशों की समीक्षा व कम्युनिटी सहभागिता।',
    location: 'दिल्ली एनसीआर',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    badge: 'यूजर / मॉडरेटर (User / Moderator)',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    permissionsDescription: 'मॉडरेशन अधिकार: पाठक टिप्पणियों (Comments) की स्वीकृति, यूजर संदेशों की समीक्षा व सुझाव।',
    allowedFeatures: ['पाठक टिप्पणियां मॉडरेशन', 'फीडबैक संदेश समीक्षा', 'रीडर प्रोफाइल'],
  },
];

export function findDemoAccount(identifier: string): DemoAccount | undefined {
  const cleanId = identifier.trim().toLowerCase();
  const normalized = cleanId.replace('@samacharfirst.com', '@gadgetglow.com');
  return DEMO_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === cleanId ||
      acc.email.toLowerCase() === normalized ||
      acc.id.toLowerCase() === cleanId ||
      acc.role === cleanId ||
      (cleanId === 'saini.pardeep45@gmail.com' && acc.role === 'super_admin') ||
      (cleanId.startsWith('superadmin@') && acc.role === 'super_admin') ||
      (cleanId.startsWith('admin@') && acc.role === 'admin') ||
      (cleanId.startsWith('editor@') && acc.role === 'editor') ||
      (cleanId.startsWith('reporter@') && acc.role === 'reporter') ||
      (cleanId.startsWith('user@') && acc.role === 'moderator')
  );
}

export function toUserProfile(account: DemoAccount): UserProfile {
  return {
    uid: account.id,
    email: account.email,
    displayName: account.name,
    role: account.role,
    designation: account.designation,
    bio: account.bio,
    photoURL: account.photoURL,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  };
}
