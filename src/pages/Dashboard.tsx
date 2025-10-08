// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();

  // البيانات
  const [animes, setAnimes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // حقول الأنمي
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("PG-13");

  // الحلقات
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // بحث
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  // 🔹 جلب البيانات
  const fetchAnimes = async () => {
    const snapshot = await getDocs(collection(db, "animes"));
    setAnimes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchAnimes();
    fetchUsers();
  }, []);

  // ✅ إدارة المستخدمين
  const updateUserRole = async (userId: string, newRole: string) => {
    await updateDoc(doc(db, "users", userId), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`تم تحديث رتبة المستخدم إلى ${newRole}`);
  };

  const toggleBanUser = async (userId: string, banned: boolean) => {
    await updateDoc(doc(db, "users", userId), { banned });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, banned } : u))
    );
    toast.success(banned ? "تم حظر المستخدم" : "تم رفع الحظر");
  };

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, "users", userId));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success("تم حذف المستخدم");
  };

  const viewUserProfile = (user: any) => {
    toast.info(`👤 ${user.name || "بدون اسم"} - ${user.email}`);
    console.log("User Profile:", user);
  };

  // ✅ إدارة الأنميات
  const addAnime = async () => {
    if (!title || !image) return toast.error("الرجاء إدخال جميع الحقول المطلوبة");
    setLoading(true);
    const newAnime = {
      title,
      desc,
      image,
      category,
      featured,
      tags: tags.split(",").map((t) => t.trim()),
      rating,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "animes"), newAnime);
    setAnimes([{ id: docRef.id, ...newAnime }, ...animes]);
    setTitle("");
    setDesc("");
    setImage("");
    toast.success("تمت إضافة الأنمي بنجاح");
    setLoading(false);
  };

  const deleteAnime = async (id: string) => {
    await deleteDoc(doc(db, "animes", id));
    setAnimes((prev) => prev.filter((a) => a.id !== id));
    toast.success("تم حذف الأنمي");
  };

  // 🔒 صلاحية الأدمن فقط
  if (!user || user.email !== "akramgourri2007@gmail.com") {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-xl font-bold">🚫 لا تملك صلاحية الوصول</h2>
        </div>
      </Layout>
    );
  }

  // ✅ واجهة الداشبورد
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">⚙️ لوحة التحكم</h1>

        {/* 📊 إحصائيات */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">الإحصائيات</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: "Animes", value: animes.length },
                { name: "Users", value: users.length },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 👤 إدارة المستخدمين */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة المستخدمين</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2 text-left">الاسم</th>
                  <th className="p-2 text-left">البريد</th>
                  <th className="p-2">الرتبة</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">الخيارات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{u.name || "غير معروف"}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <select
                        className="bg-gray-100 px-2 py-1 rounded text-sm"
                        value={u.role || "user"}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="vip">VIP</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="p-2">
                      {u.banned ? (
                        <span className="text-red-600 font-medium">محظور</span>
                      ) : (
                        <span className="text-green-600 font-medium">نشط</span>
                      )}
                    </td>
                    <td className="p-2 space-x-2">
                      <Button
                        size="sm"
                        variant={u.banned ? "default" : "destructive"}
                        onClick={() => toggleBanUser(u.id, !u.banned)}
                      >
                        {u.banned ? "رفع الحظر" : "حظر"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => viewUserProfile(u)}>
                        عرض الملف
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      لا يوجد مستخدمين
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 📺 إدارة الأنميات */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">إضافة أنمي جديد</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>العنوان</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>الصورة</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <div>
              <Label>الوصف</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <Label>التصنيف</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <Label>التصنيف العمري</Label>
              <Input value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div>
              <Label>الكلمات المفتاحية</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <Label>مميز؟</Label>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>
          </div>
          <Button className="mt-4" onClick={addAnime} disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة الأنمي"}
          </Button>
        </Card>
      </div>
    </Layout>
  );
}