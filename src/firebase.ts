import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyB5DA439aNLt34shlJ9C88AdO0LKiPdkfQ',
  authDomain: 'pantrypal-snp.firebaseapp.com',
  projectId: 'pantrypal-snp',
  storageBucket: 'pantrypal-snp.firebasestorage.app',
  messagingSenderId: '206558373414',
  appId: '1:206558373414:web:e919ba78ddd2abd2d1a8e7',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
