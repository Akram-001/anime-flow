import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

// 🧩 تعريف نوع البيانات داخل Auth Context
interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

// 🧱 إنشاء الـ Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
  loading: true,
});

// ⚡ Hook جاهز للوصول للمستخدم في أي مكان
export const useAuth = () => useContext(AuthContext);

// ⚙️ المزوّد الرئيسي (يلف كامل المشروع)
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

          // ✅ لو المستخدم جديد
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || "",
              role: "user",
              banned: false,
              createdAt: serverTimestamp(),
            });
          } else {
            const data = snap.data();

            // 🚫 التحقق من الحظر
            if (data?.banned === true) {
              toast.error("🚫 حسابك محظور", {
                description: "تواصل مع الإدارة إذا كنت تعتقد أن هناك خطأ.",
                duration: 5000,
              });

              await signOut(auth);
              setUser(null);
              window.location.href = "/login"; // 🔁 يرجعه لتسجيل الدخول
              return;
            }
          }
        } catch (error) {
          console.error("❌ Firestore Sync Error:", error);
          toast.error("حدث خطأ أثناء التحقق من حسابك.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔓 تسجيل الخروج
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast.success("تم تسجيل الخروج بنجاح");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};