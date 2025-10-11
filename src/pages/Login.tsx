import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        toast.error("User data not found.");
        setLoading(false);
        return;
      }

      const data = userDoc.data();
      if (data.banned) {
        await auth.signOut();
        setLoading(false);
        setTimeout(() => toast.error("🚫 Your account is banned."), 100);
        return;
      }

      setLoading(false);
      setTimeout(() => toast.success("👋 Welcome back!"), 100);
      navigate("/Dashboard");
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Login failed.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();

      if (data && data.banned) {
        await auth.signOut();
        setLoading(false);
        setTimeout(() => toast.error("🚫 Your account is banned."), 100);
        return;
      }

      setLoading(false);
      setTimeout(() => toast.success("👋 Welcome back!"), 100);
      navigate("/Dashboard");
    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Google login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="glass border border-primary/20 shadow-xl p-6 rounded-2xl w-full max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center gradient-text">Sign In</h1>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"/>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"/>
            <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </Button>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <Button variant="outline" className="w-full mt-3" onClick={handleGoogleLogin} disabled={loading}>
          <span className="text-red-500 font-bold text-lg">G</span> Sign In with Google
        </Button>
        <p className="text-center text-sm mt-4 text-gray-400">
          Don’t have an account? <Link to="/signup" className="text-purple-400 hover:underline">Sign Up</Link>
        </p>
      </Card>
    </div>
  );
}