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

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, serverTimestamp } from "@/lib/firebase";

export default function Dashboard() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Action");
  const [featured, setFeatured] = useState(false);
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔍 البحث والتصفية
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  // 🌀 الحلقات
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // ✅ جلب الأنميات
  const fetchAnimes = async () => {
    const snapshot = await getDocs(collection(db, "animes"));
    setAnimes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAnimes();
  }, []);

  // ✅ إضافة أنمي
  const handleAddAnime = async () => {
    if (!title || !desc || !image) {
      alert("Please fill all fields");
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
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDesc("");
      setImage("");
      setCategory("Action");
      setFeatured(false);
      fetchAnimes();
      alert("Anime added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding anime");
    }
    setLoading(false);
  };

  // ✅ حذف أنمي
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "animes", id));
    fetchAnimes();
  };

  // ✅ تغيير Featured
  const toggleFeatured = async (id: string, value: boolean) => {
    const ref = doc(db, "animes", id);
    await updateDoc(ref, { featured: value });
    fetchAnimes();
  };

  // ✅ إضافة حلقة
  const handleAddEpisode = async (animeId: string) => {
    if (!epTitle || !epNumber || !epVideo) {
      alert("Fill all episode fields");
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
      alert("Episode added ✅");
      setEpTitle("");
      setEpNumber("");
      setEpVideo("");
      setEpDuration("");
      setExpanded(null);
    } catch (err) {
      console.error("Error adding episode:", err);
    }
  };

  // ✅ فلترة الأنميات
  const filteredAnimes = animes.filter((anime) => {
    const matchSearch = anime.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || anime.category === filterCat;
    return matchSearch && matchCat;
  });

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
        <h1 className="text-2xl font-bold mb-4">⚙️ Admin Dashboard</h1>

        {/* ➕ إضافة أنمي */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Add New Anime</h2>
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
            <div className="flex items-center space-x-2">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <Label>Featured (show on homepage)</Label>
            </div>
          </div>
          <Button onClick={handleAddAnime} disabled={loading}>
            {loading ? "Adding..." : "Add Anime"}
          </Button>
        </Card>

        {/* 🔍 فلترة وبحث */}
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

        {/* 📋 جدول الأنميات */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Anime List</h2>
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
                {filteredAnimes.map((anime) => (
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
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(anime.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredAnimes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No animes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
            <Button onClick={() => handleAddEpisode(expanded)}>Save Episode</Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}