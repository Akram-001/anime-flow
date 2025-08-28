import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimeCard } from "@/components/AnimeCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Anime = {
  mal_id: number;
  title: string;
  images: { jpg: { image_url: string } };
  score: number;
  year?: number;
  genres: { name: string }[];
};

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [genre, setGenre] = useState("all");
  const [loading, setLoading] = useState(false);

  // تحميل آخر بحث من localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchResults");
    if (saved) {
      setResults(JSON.parse(saved));
    }
  }, []);

  // البحث من API
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      localStorage.removeItem("searchResults");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await res.json();
      let animes: Anime[] = data.data;

      // فلترة بالـ genre لو تم اختياره
      if (genre !== "all") {
        animes = animes.filter((a) =>
          a.genres.some((g) => g.name.toLowerCase() === genre.toLowerCase())
        );
      }

      setResults(animes);
      localStorage.setItem("searchResults", JSON.stringify(animes));
    } catch (error) {
      console.error("Search failed", error);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Search Anime
            </h1>
            <p className="text-muted-foreground">
              Discover your next favorite anime
            </p>
          </div>

          {/* Search Bar + Filters */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for anime..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 glass border-primary/20"
              />
            </div>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="h-12 w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Action">Action</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Comedy">Comedy</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => handleSearch(searchQuery)}
              className="h-12 w-24"
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : "Popular Anime"}
              </h2>
              <span className="text-muted-foreground">
                {results.length} results
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((anime) => (
                <AnimeCard
                  key={anime.mal_id}
                  anime={{
                    id: anime.mal_id,
                    title: anime.title,
                    image: anime.images.jpg.image_url,
                    rating: anime.score,
                    year: anime.year,
                    genre: anime.genres[0]?.name || "Unknown",
                  }}
                />
              ))}
            </div>

            {results.length === 0 && !loading && (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};