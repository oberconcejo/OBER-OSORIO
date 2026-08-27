import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Default Firebase Configuration with env fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForBeeCampaignAI2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bee-campaign-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bee-campaign-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bee-campaign-ai.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test connection on boot safely
async function testConnection() {
  try {
    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase running in offline / local caching mode.");
    }
  }
}

testConnection();
