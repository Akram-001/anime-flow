import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { auth } from "@/firebase";

const AccountSettings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-center text-xl font-bold">
            لازم تسجل دخول عشان توصل لإعدادات الحساب.
          </h2>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    try {
      // تحديث الاسم
      if (name && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // تحديث الإيميل
      if (email && email !== user.email) {
        await updateEmail(user, email);
      }

      // تحديث الباسورد
      if (password) {
        await updatePassword(user, password);
      }

      setMessage("✅ تم حفظ التغييرات بنجاح");
    } catch (error: any) {
      setMessage("❌ خطأ: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="glass border p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4">إعدادات الحساب</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">اسم المستخدم</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm mb-1">البريد الإلكتروني</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm mb-1">كلمة المرور</label>
              <Input 
                type="password" 
                placeholder="اكتب كلمة مرور جديدة" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSave}>
              حفظ التغييرات
            </Button>
            {message && (
              <p className="text-center text-sm mt-2">{message}</p>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AccountSettings;