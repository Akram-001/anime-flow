// ✅ إعداد Firebase بشكل آمن وحديث

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// 🔐 استخدم متغيرات البيئة من .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ⚙️ تأكد أنه ما يتم تهيئة Firebase أكثر من مرة
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ التصدير العام للمكتبات
export const auth = getAuth(app);
export const db = getFirestore(app);
export { serverTimestamp };