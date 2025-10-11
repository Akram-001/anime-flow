import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          setUser(null);
          setLoading(false);
          return;
        }

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

        const data = snap.exists() ? snap.data() : { banned: false };

        if (data?.banned) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          setTimeout(() => toast.error("🚫 Your account is banned."), 100);
          return;
        }

        setUser(currentUser);
        setLoading(false);
        setTimeout(() => toast.success(`👋 Welcome back, ${currentUser.email || "User"}!`), 100);

      } catch (error) {
        console.error("Auth error:", error);
        setLoading(false);
        setTimeout(() => toast.error("Error checking account."), 100);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    toast.success("You have logged out.");
  };

  // Prevent white screen until Firebase loaded
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};