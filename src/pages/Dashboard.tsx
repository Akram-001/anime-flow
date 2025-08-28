// src/pages/Dashboard.tsx
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

// 🟢 أنواع البيانات
interface Anime {
  id: number;
  title: string;
  category: string;
  featured: boolean;
}

interface Episode {
  id: number;
  animeId: number;
  title: string;
  number: number;
  video: string;
  duration: string;
}

interface User {
  id: number;
  email: string;
  role?: string;
  banned?: boolean;
}

export default function Dashboard() {
  // أنميات
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  // بحث + فلترة
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  // صفحات
  const [page, setPage] = useState(1);
  const perPage = 5;

  // حلقات
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");

  // يوزرات
  const [users, setUsers] = useState<User[]>([
    { id: 1, email: "admin@mail.com", role: "admin", banned: false },
    { id: 2, email: "user@mail.com", role: "user", banned: false },
  ]);

  // 📊 إحصائيات
  const stats = [
    { label: "Total Animes", value: animes.length },
    { label: "Total Episodes", value: episodes.length },
    { label: "Users", value: users.length },
  ];

  // دوال إدارة
  const handleAddAnime = () => {
    if (!title) return;
    const newAnime: Anime = {
      id: Date.now(),
      title,
      category,
      featured,
    };
    setAnimes((prev) => [...prev, newAnime]);
    setTitle("");
    setImage("");
    setDesc("");
    setCategory("");
    setTags("");
    setRating("");
    setFeatured(false);
  };

  const handleDelete = (id: number) => {
    setAnimes((prev) => prev.filter((a) => a.id !== id));
    setEpisodes((prev) => prev.filter((ep) => ep.animeId !== id));
  };

  const toggleFeatured = (id: number, val: boolean) => {
    setAnimes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, featured: val } : a))
    );
  };

  const handleAddEpisode = (animeId: number) => {
    if (!epTitle || !epNumber) return;
    const newEp: Episode = {
      id: Date.now(),
      animeId,
      title: epTitle,
      number: Number(epNumber),
      video: epVideo,
      duration: epDuration,
    };
    setEpisodes((prev) => [...prev, newEp]);
    setEpTitle("");
    setEpNumber("");
    setEpVideo("");
    setEpDuration("");
    setExpanded(null);
  };

  const toggleBanUser = (id: number, val: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, banned: val } : u))
    );
  };

  // فلترة أنمي
  const filteredAnimes = animes.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat === "All" || a.category === filterCat)
  );
  const paginated = filteredAnimes.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* 📊 إحصائيات */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.label} className="p-6 text-center shadow-md">
              <h3 className="text-sm text-gray-500">{s.label}</h3>
              <p className="text-2xl font-bold">{s.value}</p>
            </Card>
          ))}
        </div>

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
              <Label>Tags</Label>
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