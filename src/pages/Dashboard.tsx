import { useState } from "react"; import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { Label } from "@/components/ui/label"; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; import { Switch } from "@/components/ui/switch";

interface Episode { id: string; title: string; number: number; video: string; duration: string; }

interface Anime { id: string; title: string; image: string; desc: string; category: string; tags: string; rating: string; featured: boolean; episodes: Episode[]; }

export default function Dashboard() { // 📌 State أنميات const [animes, setAnimes] = useState<Anime[]>([]);

// 📌 State أنمي جديد const [title, setTitle] = useState(""); const [image, setImage] = useState(""); const [desc, setDesc] = useState(""); const [category, setCategory] = useState(""); const [tags, setTags] = useState(""); const [rating, setRating] = useState(""); const [featured, setFeatured] = useState(false);

// 📌 بحث وفلترة const [search, setSearch] = useState(""); const [filterCat, setFilterCat] = useState("All");

// 📌 إدارة الحلقات const [expanded, setExpanded] = useState<string | null>(null);

// 📌 Episode form const [epTitle, setEpTitle] = useState(""); const [epNumber, setEpNumber] = useState(""); const [epVideo, setEpVideo] = useState(""); const [epDuration, setEpDuration] = useState(""); const [editingEpId, setEditingEpId] = useState<string | null>(null);

// 📌 إضافة أنمي جديد const handleAddAnime = () => { const newAnime: Anime = { id: Date.now().toString(), title, image, desc, category, tags, rating, featured, episodes: [], }; setAnimes([...animes, newAnime]);

// reset form
setTitle("");
setImage("");
setDesc("");
setCategory("");
setTags("");
setRating("");
setFeatured(false);

};

// 📌 حذف أنمي const handleDeleteAnime = (id: string) => { setAnimes(animes.filter((a) => a.id !== id)); };

// 📌 إضافة / تعديل حلقة const handleSaveEpisode = (animeId: string) => { setAnimes((prev) => prev.map((anime) => { if (anime.id !== animeId) return anime;

if (editingEpId) {
      // تعديل
      return {
        ...anime,
        episodes: anime.episodes.map((ep) =>
          ep.id === editingEpId
            ? {
                ...ep,
                title: epTitle,
                number: Number(epNumber),
                video: epVideo,
                duration: epDuration,
              }
            : ep
        ),
      };
    } else {
      // إضافة
      const newEp: Episode = {
        id: Date.now().toString(),
        title: epTitle,
        number: Number(epNumber),
        video: epVideo,
        duration: epDuration,
      };
      return {
        ...anime,
        episodes: [...anime.episodes, newEp],
      };
    }
  })
);

// reset
setEpTitle("");
setEpNumber("");
setEpVideo("");
setEpDuration("");
setEditingEpId(null);

};

// 📌 حذف حلقة const handleDeleteEpisode = (animeId: string, epId: string) => { setAnimes((prev) => prev.map((anime) => anime.id === animeId ? { ...anime, episodes: anime.episodes.filter((ep) => ep.id !== epId) } : anime ) ); };

// 📌 بدء تعديل حلقة const startEditEpisode = (animeId: string, ep: Episode) => { setExpanded(animeId); setEditingEpId(ep.id); setEpTitle(ep.title); setEpNumber(String(ep.number)); setEpVideo(ep.video); setEpDuration(ep.duration); };

// 📌 فلترة الأنميات const filtered = animes.filter( (a) => a.title.toLowerCase().includes(search.toLowerCase()) && (filterCat === "All" || a.category === filterCat) );

return ( <div className="space-y-6"> {/* ➕ إضافة أنمي */} <Card className="p-6 space-y-4"> <h2 className="text-lg font-semibold">Add New Anime</h2> <div className="grid gap-4 md:grid-cols-2"> <div> <Label>Title</Label> <Input value={title} onChange={(e) => setTitle(e.target.value)} /> </div> <div> <Label>Image URL</Label> <Input value={image} onChange={(e) => setImage(e.target.value)} /> </div> <div className="md:col-span-2"> <Label>Description</Label> <Input value={desc} onChange={(e) => setDesc(e.target.value)} /> </div> <div> <Label>Category</Label> <Select value={category} onValueChange={setCategory}> <SelectTrigger> <SelectValue placeholder="Select category" /> </SelectTrigger> <SelectContent> <SelectItem value="Action">Action</SelectItem> <SelectItem value="Drama">Drama</SelectItem> <SelectItem value="Comedy">Comedy</SelectItem> <SelectItem value="Romance">Romance</SelectItem> <SelectItem value="Fantasy">Fantasy</SelectItem> </SelectContent> </Select> </div> <div> <Label>Tags</Label> <Input value={tags} onChange={(e) => setTags(e.target.value)} /> </div> <div> <Label>Rating</Label> <Select value={rating} onValueChange={setRating}> <SelectTrigger> <SelectValue placeholder="Select rating" /> </SelectTrigger> <SelectContent> <SelectItem value="G">G</SelectItem> <SelectItem value="PG">PG</SelectItem> <SelectItem value="PG-13">PG-13</SelectItem> <SelectItem value="R">R</SelectItem> </SelectContent> </Select> </div> <div className="flex items-center space-x-2"> <Switch checked={featured} onCheckedChange={setFeatured} /> <Label>Featured</Label> </div> </div> <Button onClick={handleAddAnime}>Add Anime</Button> </Card>

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
    {filtered.map((anime) => (
      <div key={anime.id} className="border-b py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{anime.title}</h3>
            <p className="text-sm text-gray-500">{anime.category}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setExpanded(expanded === anime.id ? null : anime.id)}>
              {expanded === anime.id ? "Close" : "Episodes"}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteAnime(anime.id)}>
              Delete
            </Button>
          </div>
        </div>

        {/* إدارة الحلقات */}
        {expanded === anime.id && (
          <div className="mt-4 space-y-4">
            {/* جدول الحلقات */}
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2">Duration</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {anime.episodes.map((ep) => (
                  <tr key={ep.id} className="border-b">
                    <td className="p-2">{ep.number}</td>
                    <td className="p-2">{ep.title}</td>
                    <td className="p-2">{ep.duration}</td>
                    <td className="p-2 flex gap-2">
                      <Button size="sm" onClick={() => startEditEpisode(anime.id, ep)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteEpisode(anime.id, ep.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {anime.episodes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center">
                      No episodes yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* فورم إضافة / تعديل حلقة */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">
                {editingEpId ? "Edit Episode" : "Add Episode"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Episode Title</Label>
                  <Input value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Episode Number</Label>
                  <Input type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input value={epVideo} onChange={(e) => setEpVideo(e.target.value)} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={epDuration} onChange={(e) => setEpDuration(e.target.value)} />
                </div>
              </div>
              <Button className="mt-3" onClick={() => handleSaveEpisode(anime.id)}>
                {editingEpId ? "Update Episode" : "Save Episode"}
              </Button>
            </Card>
          </div>
        )}
      </div>
    ))}
    {filtered.length === 0 && <p className="text-center py-4">No animes found</p>}
  </Card>
</div>

); }

