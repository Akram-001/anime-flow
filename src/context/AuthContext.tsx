// ✅ AuthProvider.tsx (نسخة كاملة ومعدّلة)
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);

          // 🧩 إذا المستخدم جديد، أضفه إلى Firestore
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

            // 🚫 تحقق من الحظر
            if (data?.banned === true) {
              toast.error("🚫 تم حظر حسابك من استخدام الموقع.", {
                description: "تواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.",
                duration: 5000,
              });

              await signOut(auth);
              setUser(null);
              navigate("/login");
              return;
            }
          }
        } catch (error) {
          console.error("❌ Error syncing user to Firestore:", error);
          toast.error("حدث خطأ أثناء التحقق من الحساب.");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    toast.success("تم تسجيل الخروج بنجاح.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};