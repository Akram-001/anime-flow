import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Anime {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: string;
}

interface User {
  id: string;
  email: string;
  role?: string;
  banned?: boolean;
}

export default function Dashboard() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newAnime, setNewAnime] = useState({
    title: "",
    description: "",
    category: "Action",
    rating: "5",
  });
  const [filterCat, setFilterCat] = useState("All");

  // 🔹 جلب الأنميات
  useEffect(() => {
    const fetchAnimes = async () => {
      const snap = await getDocs(collection(db, "animes"));
      setAnimes(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Anime[]
      );
    };
    fetchAnimes();
  }, []);

  // 🔹 جلب المستخدمين
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[]
      );
    };
    fetchUsers();
  }, []);

  // 🔹 إضافة أنمي جديد
  const addAnime = async () => {
    if (!newAnime.title.trim()) return;
    const docRef = await addDoc(collection(db, "animes"), newAnime);
    setAnimes([...animes, { id: docRef.id, ...newAnime }]);
    setNewAnime({ title: "", description: "", category: "Action", rating: "5" });
  };

  // 🔹 حذف أنمي
  const deleteAnime = async (id: string) => {
    await deleteDoc(doc(db, "animes", id));
    setAnimes(animes.filter((a) => a.id !== id));
  };

  // 🔹 حظر/إلغاء حظر مستخدم
  const toggleBanUser = async (id: string, banned: boolean) => {
    await updateDoc(doc(db, "users", id), { banned });
    setUsers(users.map((u) => (u.id === id ? { ...u, banned } : u)));
  };

  // 🔹 فلترة الأنميات
  const filteredAnimes =
    filterCat === "All"
      ? animes
      : animes.filter((a) => a.category === filterCat);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* 📌 الفلاتر */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 📌 إضافة أنمي جديد */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Anime</h2>
        <div className="space-y-3">
          <Input
            placeholder="Title"
            value={newAnime.title}
            onChange={(e) => setNewAnime({ ...newAnime, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={newAnime.description}
            onChange={(e) =>
              setNewAnime({ ...newAnime, description: e.target.value })
            }
          />
          <Select
            value={newAnime.category}
            onValueChange={(v) => setNewAnime({ ...newAnime, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={newAnime.rating}
            onValueChange={(v) => setNewAnime({ ...newAnime, rating: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addAnime}>Add Anime</Button>
        </div>
      </Card>

      {/* 📌 جدول الأنميات */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Anime List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Rating</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimes.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{a.rating}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAnime(a.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredAnimes.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    No animes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 📌 جدول المستخدمين */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="border-b bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Banned</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role || "user"}</td>
                  <td className="p-2">{u.banned ? "Yes" : "No"}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => toggleBanUser(u.id, !u.banned)}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}