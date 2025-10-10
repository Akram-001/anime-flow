import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

// 👤 نوع البيانات
interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

// 🔧 إنشاء السياق
const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
  loading: true,
});

// ✅ hook الاستخدام
export const useAuth = () => useContext(AuthContext);

// ✅ المزوّد
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [banned, setBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        // ✅ إذا المستخدم جديد
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email || "",
            role: "user",
            banned: false,
            createdAt: serverTimestamp(),
          });
        }

        // ✅ تحقق من حالة الحظر
        const data = snap.data();
        if (data && data.banned) {
          setBanned(true);
          await signOut(auth);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  // ✅ لو المستخدم محظور → رسالة فقط
  if (banned) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Alert variant="destructive" className="max-w-md text-center">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>الحساب محظور</AlertTitle>
          <AlertDescription>
            تم حظر حسابك من الوصول للموقع. إذا كنت ترى أن هذا خطأ، تواصل مع الإدارة.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ✅ عرض التطبيق إذا كل شيء تمام
  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};