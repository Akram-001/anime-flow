// src/pages/Signup.tsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      alert("❌ الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (password.length < 6) {
      alert("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ User created:", userCredential.user);

      alert("🎉 تم إنشاء الحساب بنجاح");
      navigate("/profile"); // ✅ توجيه المستخدم بعد التسجيل
    } catch (err: any) {
      console.error("❌ Signup error:", err.message);
      alert("خطأ في إنشاء الحساب: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 shadow-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700">
          <CardContent className="space-y-6">
            <h1 className="text-2xl font-bold text-center text-white">إنشاء حساب جديد</h1>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-purple-500"
              />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>

              <p className="text-center text-gray-400 text-sm">
                لديك حساب؟{" "}
                <Link to="/login" className="text-purple-400 hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
