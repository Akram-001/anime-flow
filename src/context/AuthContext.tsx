import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // مستخدم جديد
          const newUserData = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            role: "user",
            banned: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
          setUser(currentUser);
        } else {
          const data = snap.data();

          // 🔥 تحقق مباشر من الحظر
          if (data?.banned === true) {
            await signOut(auth);
            setUser(null);
            setUserData(null);
            alert("🚫 حسابك محظور ولا يمكنك تسجيل الدخول.");
            return;
          }

          // المستخدم طبيعي
          setUser(currentUser);
          setUserData(data);
        }
      } catch (err) {
        console.error("Error checking user:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};