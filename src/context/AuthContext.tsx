import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// 👤 تعريف نوع بيانات الـ context
interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

// 🔧 إنشاء الـ context بقيم افتراضية
const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
  loading: true,
});

// ✅ Hook جاهز للاستخدام في أي مكان
export const useAuth = () => useContext(AuthContext);

// ✅ المزوّد الرئيسي (يلف كل التطبيق)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);

          // ✅ إذا المستخدم جديد، أضفه إلى Firestore
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || "",
              role: "user",
              banned: false,
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error syncing user to Firestore:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🧩 تسجيل الخروج
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};