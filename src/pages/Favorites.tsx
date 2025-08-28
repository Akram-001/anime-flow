import { Layout } from "@/components/Layout";
import { Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/components/AnimeCard";
import { useEffect, useState } from "react";

type Anime = {
  id: number;
  title: string;
  image: string;
  rating?: number;
  year?: number;
  genre?: string;
  downloaded?: boolean; // علشان نقدر نفرق بين اللي تم تحميله واللي لا
  addedAt?: number; // تاريخ الإضافة
};

export const Favorites = () => {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [filter, setFilter] = useState<"all" | "recent" | "downloaded">("all");

  // تحميل المفضلة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // حفظ أي تعديل يصير على المفضلة
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // فلترة العرض حسب الأزرار
  const filteredFavorites = favorites.filter((anime) => {
    if (filter === "downloaded") return anime.downloaded;
    if (filter === "recent") {
      return (
        anime.addedAt &&
        Date.now() - anime.addedAt < 1000 * 60 * 60 * 24 * 7 // آخر أسبوع
      );
    }
    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary fill-current" />
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                My Favorites
              </h1>
            </div>
            <p className="text-muted-foreground">
              Your saved anime collection
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Button
              variant={filter === "recent" ? "default" : "outline"}
              onClick={() => setFilter("recent")}
            >
              <Heart className="w-4 h-4 mr-2" />
              Recently Added
            </Button>
            <Button
              variant={filter === "downloaded" ? "default" : "outline"}
              onClick={() => setFilter("downloaded")}
            >
              <Download className="w-4 h-4 mr-2" />
              Downloaded
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
          </div>

          {/* Favorites Grid */}
          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFavorites.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start adding anime to your favorites to see them here
              </p>
              <Button variant="hero">
                Browse Anime
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};