// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
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
import { toast } from "sonner"; // للإشعارات
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

// 📌 الواجهة الرئيسية للوحة التحكم
export default function Dashboard() {
  const { user } = useAuth();
  const [animes, setAnimes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 📌 الحقول لإضافة أنمي
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("PG-13");

  // 📌 بحث + فلترة + Pagination
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  // 📌 الحلقات
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // 📌 جلب الأنميات
  const fetchAnimes = async () => {
    const snapshot = await getDocs(collection(db, "animes"));
    setAnimes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 📌 جلب المستخدمين (لو حبيت تديرهم)
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchAnimes();
    fetchUsers();
  }, []);

  // ✅ إضافة أنمي
  const handleAddAnime = async () => {
    if (!title || !desc || !image) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "animes"), {
        title,
        description: desc,
        image,
        category,
        featured,
        tags: tags.split(",").map((t) => t.trim()),
        rating,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDesc("");
      setImage("");
      setCategory("Action");
      setFeatured(false);
      setTags("");
      setRating("PG-13");
      fetchAnimes();
      toast.success("Anime added successfully!");
    } catch (err) {
      toast.error("Error adding anime");
    }
    setLoading(false);
  };

  // ✅ حذف أنمي
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "animes", id));
    fetchAnimes();
    toast.success("Anime deleted");
  };

  // ✅ تعديل Featured
  const toggleFeatured = async (id: string, value: boolean) => {
    await updateDoc(doc(db, "animes", id), { featured: value });
    fetchAnimes();
    toast.success("Updated successfully");
  };

  // ✅ إضافة حلقة
  const handleAddEpisode = async (animeId: string) => {
    if (!epTitle || !epNumber || !epVideo) {
      toast.error("Fill all episode fields");
      return;
    }
    try {
      await addDoc(collection(db, "animes", animeId, "episodes"), {
        title: epTitle,
        number: Number(epNumber),
        videoUrl: epVideo,
        duration: epDuration,
        createdAt: serverTimestamp(),
      });
      setEpTitle("");
      setEpNumber("");
      setEpVideo("");
      setEpDuration("");
      setExpanded(null);
      toast.success("Episode added");
    } catch {
      toast.error("Error adding episode");
    }
  };

  // ✅ إدارة المستخدمين (تغيير رول / حظر)
  const toggleBanUser = async (id: string, banned: boolean) => {
    await updateDoc(doc(db, "users", id), { banned });
    fetchUsers();
    toast.success(banned ? "User banned" : "User unbanned");
  };

  // ✅ فلترة وبحث + Pagination
  const filteredAnimes = animes.filter((anime) => {
    const matchSearch = anime.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || anime.category === filterCat;
    return matchSearch && matchCat;
  });
  const paginated = filteredAnimes.slice((page - 1) * perPage, page * perPage);

  // 📊 بيانات للإحصائيات
  const chartData = [
    { name: "Animes", value: animes.length },
    { name: "Users", value: users.length },
  ];

  // السماح فقط للإدمن
  if (!user || user.email !== "akramgourri2007@gmail.com") {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold">⚙️ Admin Dashboard</h1>

        {/* 📊 الإحصائيات */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ➕ إضافة أنمي */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add New Anime</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <Label>Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="PG-13">PG-13</SelectItem>
                  <SelectItem value="R">R</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <Label>Featured</Label>
            </div>
          </div>
          <Button onClick={handleAddAnime} disabled={loading}>
            {loading ? "Adding..." : "Add Anime"}
          </Button>
        </Card>

        {/* 🔍 بحث + فلترة */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Comedy">Comedy</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 📋 قائمة الأنميات */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Anime List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Featured</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((anime) => (
                  <tr key={anime.id} className="border-b">
                    <td className="p-2">{anime.title}</td>
                    <td className="p-2">{anime.category}</td>
                    <td className="p-2 text-center">
                      <Switch
                        checked={anime.featured}
                        onCheckedChange={(val) => toggleFeatured(anime.id, val)}
                      />
                    </td>
                    <td className="p-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          setExpanded(expanded === anime.id ? null : anime.id)
                        }
                      >
                        {expanded === anime.id ? "Close" : "Add Episode"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(anime.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      No animes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span>Page {page}</span>
            <Button
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * perPage >= filteredAnimes.length}
            >
              Next
            </Button>
          </div>
        </Card>

        {/* 📺 إضافة حلقة */}
        {expanded && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add Episode</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Episode Title</Label>
                <Input
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Episode Number</Label>
                <Input
                  type="number"
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value)}
                />
              </div>
              <div>
                <Label>Video URL</Label>
                <Input
                  value={epVideo}
                  onChange={(e) => setEpVideo(e.target.value)}
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  placeholder="24m"
                  value={epDuration}
                  onChange={(e) => setEpDuration(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => handleAddEpisode(expanded)}>
              Save Episode
            </Button>
          </Card>
        )}

        {/* 👤 إدارة المستخدمين */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Manage Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
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
    </Layout>
  );
}