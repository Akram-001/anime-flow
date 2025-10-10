import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner"; // ✅ Toast notifications

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
          setUser(currentUser);
          setLoading(false);
          toast.success(`Welcome back, ${currentUser.email}!`);
          return;
        }

        const data = snap.data();

        // 🚫 If user is banned → block immediately
        if (data?.banned) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          toast.error("Your account has been banned.");
          return;
        }

        // ✅ Normal user
        setUser(currentUser);
        setLoading(false);
        toast.success(`Welcome back, ${currentUser.email}!`);
      } catch (err) {
        console.error("Auth error:", err);
        setLoading(false);
        toast.error("An error occurred while loading your account.");
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    toast.success("You have logged out.");
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};