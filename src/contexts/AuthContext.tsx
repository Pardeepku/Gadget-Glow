import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isLive } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { DEMO_ACCOUNTS, DemoAccount, findDemoAccount, toUserProfile } from '../data/demoAccounts';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isLiveFirebase: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (account: DemoAccount) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_SESSION_KEY = 'sf_demo_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(DEMO_SESSION_KEY);
      if (saved) {
        return JSON.parse(saved) as UserProfile;
      }
    } catch (e) {
      console.warn('Failed to parse saved user session:', e);
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && isLive) {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser && db) {
          try {
            const userRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userRef);

            const isSuperAdminEmail =
              fbUser.email?.toLowerCase() === 'saini.pardeep45@gmail.com' ||
              fbUser.email?.toLowerCase() === 'superadmin@gadgetglow.com' ||
              fbUser.email?.toLowerCase() === 'superadmin@samacharfirst.com';

            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              const profile: UserProfile = {
                ...data,
                uid: fbUser.uid,
                email: fbUser.email || data.email || '',
              };
              setCurrentUser(profile);
              localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile));
            } else {
              // Create user record in Firestore on first login
              const initialProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName:
                  fbUser.displayName ||
                  (isSuperAdminEmail ? 'प्रदीप सैनी' : fbUser.email?.split('@')[0] || 'CMS Admin'),
                role: isSuperAdminEmail ? 'super_admin' : 'admin',
                designation: isSuperAdminEmail ? 'प्रधान संपादक (Super Admin)' : 'संपादक (Editor)',
                photoURL: fbUser.photoURL || undefined,
                createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
              };

              await setDoc(userRef, initialProfile, { merge: true });
              setCurrentUser(initialProfile);
              localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(initialProfile));
            }
          } catch (err) {
            console.error('Error fetching/setting user profile from Firestore:', err);
            const isSuperAdminEmail =
              fbUser.email?.toLowerCase() === 'saini.pardeep45@gmail.com' ||
              fbUser.email?.toLowerCase() === 'superadmin@gadgetglow.com' ||
              fbUser.email?.toLowerCase() === 'superadmin@samacharfirst.com';
            const fallbackProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || (isSuperAdminEmail ? 'प्रदीप सैनी' : 'CMS Staff'),
              role: isSuperAdminEmail ? 'super_admin' : 'editor',
              createdAt: new Date().toISOString(),
              isActive: true,
            };
            setCurrentUser(fallbackProfile);
            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(fallbackProfile));
          }
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Check Demo Accounts First
    const matchedAccount = findDemoAccount(cleanEmail);
    if (matchedAccount) {
      // Validate password (account specific, or Admin@123 / 123456 / SuperAdmin@2026)
      const validPasswords = [
        matchedAccount.password.toLowerCase(),
        'admin@123',
        '123456',
        'superadmin@2026',
        'admin@2026',
        'editor@2026',
        'reporter@2026',
        'user@2026',
      ];
      if (validPasswords.includes(cleanPass.toLowerCase()) || cleanPass === matchedAccount.password) {
        const profile = toUserProfile(matchedAccount);
        profile.lastLogin = new Date().toISOString();
        setCurrentUser(profile);
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile));

        // Optionally record in Firestore users collection if db connected
        if (db) {
          try {
            await setDoc(doc(db, 'users', matchedAccount.id), profile, { merge: true });
          } catch (e) {
            console.warn('Could not mirror demo user in Firestore:', e);
          }
        }
        return;
      }
    }

    // 2. Try Firebase Auth if live
    if (auth && isLive) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        return;
      } catch (fbErr: any) {
        // If not found in Firebase and matched demo account with wrong pass, give clear error
        if (matchedAccount) {
          throw new Error(`गलत पासवर्ड। ${matchedAccount.name} के लिए सही पासवर्ड '${matchedAccount.password}' है।`);
        }
        throw fbErr;
      }
    }

    throw new Error('अमान्य ईमेल अथवा पासवर्ड। कृपया नीचे दिए गए डेमो खातों में से किसी एक पर क्लिक करके लॉगिन करें।');
  };

  const quickDemoLogin = async (account: DemoAccount) => {
    const profile = toUserProfile(account);
    profile.lastLogin = new Date().toISOString();
    setCurrentUser(profile);
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(profile));

    // Mirror to Firestore if available
    if (db) {
      try {
        await setDoc(doc(db, 'users', account.id), profile, { merge: true });
      } catch (e) {
        console.warn('Could not mirror quick demo user in Firestore:', e);
      }
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem(DEMO_SESSION_KEY);
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const resetPassword = async (email: string) => {
    if (auth && isLive) {
      await sendPasswordResetEmail(auth, email.trim());
      return;
    }
    // For demo accounts, explain reset
    const matched = findDemoAccount(email);
    if (matched) {
      throw new Error(`यह डेमो खाता है। ${matched.name} का पासवर्ड है: "${matched.password}"`);
    }
    throw new Error('Firebase Authentication कॉन्फ़िगर नहीं है।');
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isLiveFirebase: Boolean(isLive),
        login,
        quickDemoLogin,
        logout,
        resetPassword,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

