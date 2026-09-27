import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

// Read from generated firebase-applet-config.json with Vite env override
export function getFirebaseConfig(): FirebaseClientConfig {
  const fileConfig = (firebaseAppletConfig as any) || {};
  const env = (import.meta as any).env || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || fileConfig.apiKey || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || fileConfig.authDomain || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || fileConfig.projectId || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || fileConfig.storageBucket || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || fileConfig.messagingSenderId || '',
    appId: env.VITE_FIREBASE_APP_ID || fileConfig.appId || '',
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || fileConfig.measurementId || '',
    firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || fileConfig.firestoreDatabaseId || '',
  };
}

export function isFirebaseConfigured(config: FirebaseClientConfig = getFirebaseConfig()): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initFirebase(customConfig?: FirebaseClientConfig) {
  const config = customConfig || getFirebaseConfig();
  
  if (!isFirebaseConfigured(config)) {
    return { app: null, auth: null, db: null, storage: null, isLive: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    try {
      if (config.firestoreDatabaseId) {
        db = initializeFirestore(app, { ignoreUndefinedProperties: true }, config.firestoreDatabaseId);
      } else {
        db = initializeFirestore(app, { ignoreUndefinedProperties: true });
      }
    } catch {
      db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
    }
    storage = getStorage(app);

    return { app, auth, db, storage, isLive: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, storage: null, isLive: false, error };
  }
}

// Initial setup
const { isLive } = initFirebase();
export { app, auth, db, storage, isLive };


