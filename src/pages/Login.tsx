// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful");
      navigate("/profile"); // يروح للبروفايل بعد تسجيل الدخول
    } catch (err: any) {
      console.error("❌ Login error:", err.message);
      setError("خطأ في تسجيل الدخول: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <Card className="w-full max-w-md p-6 shadow-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700">
        <CardContent>
          <h1 className="text-2xl font-bold text-center mb-6 text-white">تسجيل الدخول</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-purple-500"
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-purple-500"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              disabled={loading}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-400">
            ماعندك حساب؟{" "}
            <Link to="/signup" className="text-purple-400 hover:underline">
              إنشاء حساب
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
