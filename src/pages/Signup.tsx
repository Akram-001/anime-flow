import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, User, Google } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "user",
        banned: false,
        createdAt: serverTimestamp(),
      });

      navigate("/profile");
    } catch (err: any) {
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") msg = "Email is already in use";
      if (err.code === "auth/invalid-email") msg = "Invalid email address";
      if (err.code === "auth/weak-password") msg = "Password is too weak (min 6 characters)";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="glass border border-primary/20 shadow-xl p-6 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center gradient-text">
          Create Your Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="email"
              placeholder="Email Address"
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

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Sign Up Button */}
          <Button
            type="submit"
            variant="hero"
            className="w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          {/* OR divider */}
          <div className="flex items-center justify-center gap-3 my-2 text-gray-400">
            <span className="border-t border-gray-300 flex-1"></span>
            <span>OR</span>
            <span className="border-t border-gray-300 flex-1"></span>
          </div>

          {/* Google Sign In (اختياري) */}
          <Button variant="outline" className="w-full py-2 flex items-center justify-center gap-2">
            <Google className="w-5 h-5" />
            Sign Up with Google
          </Button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}