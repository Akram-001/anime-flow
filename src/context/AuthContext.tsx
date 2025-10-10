import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || "",
              role: "user",
              banned: false,
              createdAt: serverTimestamp(),
            });
          }

          const data = snap.data();

          // 🚫 المستخدم محظور
          if (data && data.banned) {
            await signOut(auth);
            setUser(null);

            toast({
              title: "🚫 حسابك محظور",
              description: "تم تعطيل وصولك إلى الموقع. تواصل مع الإدارة إذا تعتقد أن هناك خطأ.",
              variant: "default", // نفس شكل التوستات البيضاء السابقة
              duration: 5000,
            });
          } else {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("Auth check error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const logout = async () => {
    await signOut(auth);
  };

  // 🔒 لو المستخدم محظور أو مو مسجل، ما يشوف الموقع أبداً
  if (loading) return null;
  if (!user) return <></>; // يبقى بصفحة تسجيل الدخول فقط

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};