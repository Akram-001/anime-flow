// src/services/userService.ts
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const registerUser = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // خزّن المستخدم في Firestore
  await setDoc(doc(db, "users", user.uid), {
    name,
    email: user.email,
    role: "user",
    createdAt: new Date(),
  });

  return user;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // خزّن أو حدث بيانات المستخدم
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    role: "user",
    createdAt: new Date(),
  }, { merge: true });

  return user;
};
