import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase"; // 👈 استدعاء auth من ملف firebase.ts

// ✅ تعريف شكل البيانات داخل الـ context
interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
}

// ✅ إنشـاء الـ context
const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
});

// Hook جاهز للاستخدام
export const useAuth = () => useContext(AuthContext);

// ✅ AuthProvider يلف كل التطبيق
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // دالة تسجيل الخروج
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
