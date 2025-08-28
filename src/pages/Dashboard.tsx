import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type Anime = {
  id: string
  title: string
  category: string
  featured: boolean
}

export default function AnimeDashboard() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState("All")

  // بيانات تجريبية
  const [animes, setAnimes] = useState<Anime[]>([
    { id: "1", title: "Naruto", category: "Action", featured: false },
    { id: "2", title: "Your Name", category: "Romance", featured: true },
    { id: "3", title: "Attack on Titan", category: "Fantasy", featured: false },
  ])

  // فلترة حسب الكاتيجوري
  const filteredAnimes =
    filter === "All" ? animes : animes.filter((a) => a.category === filter)

  const toggleFeatured = (id: string, val: boolean) => {
    setAnimes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, featured: val } : a))
    )
  }

  const handleDelete = (id: string) => {
    setAnimes((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🔽 فلتر الكاتيجوري */}
      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="All">All Categories</SelectItem>
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
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAnimes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No animes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}