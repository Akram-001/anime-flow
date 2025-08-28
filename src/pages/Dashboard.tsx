import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Anime {
  id: string;
  title: string;
  image: string;
  desc: string;
  category: string;
  tags: string[];
  rating: string;
  featured: boolean;
}

interface Episode {
  id: string;
  title: string;
  number: number;
  video: string;
  duration: string;
}

interface User {
  id: string;
  email: string;
}

export default function Dashboard() {
  // 🔹 Animes
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState("");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Episodes
  const [expanded, setExpanded] = useState<string | null>(null);
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epVideo, setEpVideo] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [episodes, setEpisodes] = useState<Record<string, Episode[]>>({});

  // 🔹 Users
  const [users, setUsers] = useState<User[]>([]);

  // 🔹 Search & Filter
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  // 🔹 Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;

  // ============================
  // 📌 FETCH FUNCTIONS
  // ============================
  const fetchAnimes = async () => {
    const snapshot = await getDocs(collection(db, "animes"));
    const list: Anime[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Anime, "id">),
    }));
    setAnimes(list);
  };

  const fetchEpisodes = async (animeId: string) => {
    const snapshot = await getDocs(collection(db, `animes/${animeId}/episodes`));
    const list: Episode[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Episode, "id">),
    }));
    setEpisodes((prev) => ({ ...prev, [animeId]: list }));
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));
    setUsers(list);
  };

  useEffect(() => {
    fetchAnimes();
    fetchUsers();
  }, []);

  // ============================
  // 📌 ANIME CRUD
  // ============================
  const handleAddAnime = async () => {
    if (!title) return;
    setLoading(true);
    await addDoc(collection(db, "animes"), {
      title,
      image,
      desc,
      category,
      tags: tags.split(",").map((t) => t.trim()),
      rating,
      featured,
    });
    setTitle("");
    setImage("");
    setDesc("");
    setCategory("");
    setTags("");
    setRating("");
    setFeatured(false);
    setLoading(false);
    fetchAnimes();
  };

  const handleDeleteAnime = async (id: string) => {
    await deleteDoc(doc(db, "animes", id));
    fetchAnimes();
  };

  const toggleFeatured = async (id: string, val: boolean) => {
    await updateDoc(doc(db, "animes", id), { featured: val });
    fetchAnimes();
  };

  // ============================
  // 📌 EPISODES CRUD
  // ============================
  const handleAddEpisode = async (animeId: string) => {
    if (!epTitle || !epNumber) return;
    await addDoc(collection(db, `animes/${animeId}/episodes`), {
      title: epTitle,
      number: parseInt(epNumber),
      video: epVideo,
      duration: epDuration,
    });
    setEpTitle("");
    setEpNumber("");
    setEpVideo("");
    setEpDuration("");
    fetchEpisodes(animeId);
  };

  const handleDeleteEpisode = async (animeId: string, epId: string) => {
    await deleteDoc(doc(db, `animes/${animeId}/episodes`, epId));
    fetchEpisodes(animeId);
  };

  // ============================
  // 📌 FILTERING
  // ============================
  const filteredAnimes = animes.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat === "All" || a.category === filterCat)
  );

  const paginated = filteredAnimes.slice((page - 1) * perPage, page * perPage);

  // ============================
  // 📌 UI
  // ============================
  return (
    <div className="space-y-8 p-6">
      {/* ➕ Add Anime */}
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

      {/* 🔍 Search + Filter */}
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

      {/* 📋 Anime List */}
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
                      onClick={() => {
                        setExpanded(expanded === anime.id ? null : anime.id);
                        fetchEpisodes(anime.id);
                      }}
                    >
                      {expanded === anime.id ? "Close" : "Add Episode"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAnime(anime.id)}
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

      {/* 📺 Add Episode */}
      {expanded && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Episodes</h2>
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

          {/* 📋 Episodes List */}
          <div className="mt-6">
            <h3 className="font-medium mb-2">Episode List</h3>
            <ul className="space-y-2">
              {episodes[expanded]?.map((ep) => (
                <li
                  key={ep.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    Ep {ep.number}: {ep.title} ({ep.duration})
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteEpisode(expanded, ep.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
              {(!episodes[expanded] || episodes[expanded].length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No episodes yet
                </p>
              )}
            </ul>
          </div>
        </Card>
      )}

      {/* 👤 Users */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>{u.email}</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteDoc(doc(db, "users", u.id)).then(fetchUsers)}
              >
                Delete
              </Button>
            </li>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users found</p>
          )}
        </ul>
      </Card>
    </div>
  );
}