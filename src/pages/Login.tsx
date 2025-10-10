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

      // 🔎 تحقق من حالة الحظر
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        toast.error("المستخدم غير موجود في قاعدة البيانات.");
        setLoading(false);
        return;
      }

      const data = userDoc.data();

      if (data.banned) {
        // 🚫 المستخدم محظور
        await auth.signOut();
        toast("🚫 حسابك محظور", {
          description: "تم تعطيل وصولك إلى الموقع، تواصل مع الإدارة إذا كنت ترى أن هذا خطأ.",
          duration: 5000,
        });
        setLoading(false);
        return; // 👈 ما ينتقل أبداً
      }

      // ✅ مستخدم عادي، يدخل الموقع
      toast("👋 مرحباً بعودتك!", {
        description: "تم تسجيل الدخول بنجاح.",
        duration: 4000,
      });
      navigate("/Dashboard");

    } catch (error: any) {
      toast.error("فشل تسجيل الدخول: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 تسجيل الدخول بـ Google
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
        toast("🚫 حسابك محظور", {
          description: "تم تعطيل وصولك إلى الموقع.",
          duration: 5000,
        });
        return;
      }

      toast("👋 مرحباً بعودتك!", {
        description: "تم تسجيل الدخول بنجاح.",
        duration: 4000,
      });
      navigate("/Dashboard");
    } catch (err: any) {
      toast.error(err.message || "فشل تسجيل الدخول بـ Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="glass border border-primary/20 shadow-xl p-6 rounded-2xl w-full max-w-md animate-fade-in">
        <h1 className="text-2xl font-bold mb-6 text-center gradient-text">
          تسجيل الدخول
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="كلمة المرور"
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

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={loading}
          >
            {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 border-gray-300 hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="text-red-500 font-bold text-lg">G</span>
          تسجيل الدخول بـ Google
        </Button>

        <p className="text-center text-sm mt-4 text-gray-400">
          ليس لديك حساب؟{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            إنشاء حساب
          </Link>
        </p>
      </Card>
    </div>
  );
}