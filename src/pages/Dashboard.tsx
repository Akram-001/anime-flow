/* src/pages/Dashboard.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  query,
  orderBy,
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

const OWNER_EMAIL = "akramgourri2007@gmail.com";

type UserRecord = {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  createdAt?: any;
  [k: string]: any;
};

export default function Dashboard(): JSX.Element {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // anime form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("PG-13");

  // episode
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUser, setModalUser] = useState<UserRecord | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  const currentUserRole = useMemo(() => {
    if (!user) return null;
    const match = users.find((u) => u.email === user.email);
    if (match) return match.role;
    if (user.email === OWNER_EMAIL) return "owner";
    return null;
  }, [user, users]);

  // 🔒 صلاحيات دقيقة حسب الرتبة
  const canManageUsers = useMemo(() => ["owner"].includes(currentUserRole || ""), [currentUserRole]);
  const canEditUsers = useMemo(() => ["admin", "owner", "founder"].includes(currentUserRole || ""), [currentUserRole]);
  const canModerate = useMemo(() => ["moderator", "admin", "owner", "founder"].includes(currentUserRole || ""), [currentUserRole]);
  const hasDashboardAccess = useMemo(() => ["admin", "owner", "founder"].includes(currentUserRole || ""), [currentUserRole]);

  // 🔹 جلب البيانات
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserRecord)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnimes = async () => {
    try {
      const snap = await getDocs(collection(db, "animes"));
      setAnimes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnimes();
  }, []);

  // ---------------- User Actions ----------------
  const updateUserRole = async (userId: string, newRole: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // 🔒 حماية الأونر
    if (target.email === OWNER_EMAIL && user?.email !== OWNER_EMAIL) {
      return toast.error("لا يمكنك تعديل رتبة الـ Owner");
    }

    // 🔒 حماية الرتب
    if (currentUserRole !== "owner") {
      return toast.error("صلاحياتك لا تسمح بتغيير الرتب");
    }

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success("تم تحديث الرتبة");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const toggleBanUser = async (userId: string, banned: boolean) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // 🔒 ممنوع حظر الأونر
    if (target.email === OWNER_EMAIL) return toast.error("لا يمكنك حظر الـ Owner");

    // 🔒 الفاوندر ما يقدر يحظر الأونر
    if (currentUserRole === "founder" && target.role === "owner") {
      return toast.error("الـ Founder لا يمكنه حظر Owner");
    }

    if (!canModerate) return toast.error("لا تملك صلاحيات الحظر");

    try {
      await updateDoc(doc(db, "users", userId), { banned });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, banned } : u)));
      toast.success(banned ? "تم حظر المستخدم" : "تم رفع الحظر");
    } catch (err) {
      console.error(err);
      toast.error("خطأ أثناء تحديث الحالة");
    }
  };

  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.email === OWNER_EMAIL) return toast.error("لا يمكنك حذف الـ Owner");

    if (!canManageUsers) return toast.error("ليس لديك صلاحية الحذف");

    if (!confirm(`هل تريد حذف ${target.email}؟`)) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("تم حذف المستخدم");
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف المستخدم");
    }
  };

  const openUserModal = (u: UserRecord) => {
    setModalUser(u);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setModalUser(null);
    setShowUserModal(false);
  };

  const saveModalUser = async () => {
    if (!modalUser) return;
    if (currentUserRole !== "owner") return toast.error("لا تملك صلاحية الحفظ");
    setModalSaving(true);
    try {
      await updateDoc(doc(db, "users", modalUser.id), {
        name: modalUser.name,
        role: modalUser.role,
        banned: modalUser.banned,
      });
      setUsers((prev) => prev.map((u) => (u.id === modalUser.id ? modalUser : u)));
      toast.success("تم الحفظ");
      closeUserModal();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setModalSaving(false);
    }
  };

  // ---------------- Access Restriction ----------------
  if (!user || !hasDashboardAccess) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-xl font-bold">🚫 لا تملك صلاحية الوصول</h2>
        </div>
      </Layout>
    );
  }

  // ---------------- UI ----------------
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">🛠️ لوحة التحكم</h1>

        {/* إدارة المستخدمين */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة المستخدمين</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left">الاسم</th>
                <th className="p-2 text-left">الإيميل</th>
                <th className="p-2 text-center">الرتبة</th>
                <th className="p-2 text-center">الحالة</th>
                <th className="p-2 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.name || "—"}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 text-center">
                    <select
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                      value={u.role || "user"}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      disabled={!canManageUsers}
                    >
                      <option value="user">User</option>
                      <option value="vip">VIP</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="founder">Founder</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    {u.banned ? (
                      <span className="text-red-600 font-semibold">محظور</span>
                    ) : (
                      <span className="text-green-600 font-semibold">نشط</span>
                    )}
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openUserModal(u)}>
                      عرض
                    </Button>
                    <Button
                      size="sm"
                      variant={u.banned ? "default" : "destructive"}
                      onClick={() => toggleBanUser(u.id, !u.banned)}
                      disabled={!canModerate}
                    >
                      {u.banned ? "فك الحظر" : "حظر"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(u.id)}
                      disabled={!canManageUsers}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* مودال المستخدم */}
      {showUserModal && modalUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-xl">
            <h3 className="text-lg font-semibold mb-4">الملف الشخصي</h3>
            <Label>الاسم</Label>
            <Input
              value={modalUser.name || ""}
              onChange={(e) => setModalUser({ ...modalUser, name: e.target.value })}
            />
            <Label className="mt-4">الإيميل</Label>
            <Input value={modalUser.email || ""} disabled />

            <Label className="mt-4">الرتبة</Label>
            <select
              className="bg-gray-100 px-2 py-1 rounded text-sm w-full"
              value={modalUser.role || "user"}
              onChange={(e) => setModalUser({ ...modalUser, role: e.target.value })}
              disabled={!canManageUsers}
            >
              <option value="user">User</option>
              <option value="vip">VIP</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="founder">Founder</option>
              <option value="owner">Owner</option>
            </select>

            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={!!modalUser.banned}
                onCheckedChange={(val) => setModalUser({ ...modalUser, banned: val })}
              />
              <span>{modalUser.banned ? "محظور" : "نشط"}</span>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <Button variant="ghost" onClick={closeUserModal}>
                إلغاء
              </Button>
              <Button onClick={saveModalUser} disabled={modalSaving}>
                {modalSaving ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}