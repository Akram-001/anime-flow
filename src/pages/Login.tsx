import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Google } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      toast.success(`Welcome back, ${user.displayName || user.email}!`);
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.code === "auth/invalid-email"
          ? "Invalid email format."
          : "Login failed. Try again later.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // حفظ المستخدم في Firestore إذا جديد
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          name: user.displayName,
          email: user.email,
          role: "user",
          banned: false,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast.success(`Welcome, ${user.displayName || user.email}!`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error("Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="glass border border-primary/20 shadow-xl p-6 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center gradient-text">
          Sign In
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="hero"
            className="w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-3 my-2 text-gray-400">
            <span className="border-t border-gray-300 flex-1"></span>
            <span>OR</span>
            <span className="border-t border-gray-300 flex-1"></span>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full py-2 flex items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Google className="w-5 h-5" />
            Sign In with Google
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
}