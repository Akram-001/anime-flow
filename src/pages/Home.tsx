import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/HeroSection";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Fire, Star, Clock, Sparkles } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Anime {
  id: string;
  title: string;
  image: string;
  rating?: number;
  genre?: string;
  episodes?: number;
  year?: number;
  isTrending?: boolean;
  isNew?: boolean;
  createdAt?: any;
  deleted?: boolean;
}

const AnimeSection = ({
  title,
  icon,
  anime,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  anime: Anime[];
  loading?: boolean;
}) => {
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (dir: "left" | "right") => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, "")}`);
    if (!container) return;
    const scrollAmount = 320;
    const newPos =
      dir === "left"
        ? Math.max(0, scrollPos - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPos + scrollAmount);
    container.scrollTo({ left: newPos, behavior: "smooth" });
    setScrollPos(newPos);
  };

  useEffect(() => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, "")}`);
    if (!container) return;
    const handleScroll = () => setScrollPos(container.scrollLeft);
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [title]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-3xl font-bold gradient-text">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={scrollPos === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-80 h-56 bg-gray-800 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div
            id={`scroll-${title.replace(/\s+/g, "")}`}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          >
            {anime
              .filter((a) => a.image && a.title)
              .map((a, idx) => (
                <div
                  key={a.id}
                  className="flex-none w-80 transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <AnimeCard anime={a} />
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const Home = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const q = query(collection(db, "animes"), orderBy("createdAt", "desc"), limit(100));
        const snapshot = await getDocs(q);
        const list: Anime[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.title && data.image && !data.deleted) {
            list.push({ id: doc.id, ...data } as Anime);
          }
        });
        setAnimes(list);
      } catch (err) {
        console.error("Error fetching animes:", err);
        toast.error("Failed to load animes");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimes();
  }, []);

  const trending = animes.filter((a) => a.isTrending);
  const newReleases = animes.filter((a) => a.isNew);
  const topRated = [...animes].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const heroAnime = animes[0] || null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-hero transition-opacity duration-1000 opacity-100">
        {heroAnime && <HeroSection anime={heroAnime} />}

        <AnimeSection title="Trending Now" icon={<Fire className="w-8 h-8 text-warning" />} anime={trending} loading={loading} />
        <AnimeSection title="New Releases" icon={<Sparkles className="w-8 h-8 text-primary" />} anime={newReleases} loading={loading} />
        <AnimeSection title="Top Rated" icon={<Star className="w-8 h-8 text-accent" />} anime={topRated} loading={loading} />
        <AnimeSection title="Continue Watching" icon={<Clock className="w-8 h-8 text-secondary" />} anime={animes.slice(0, 4)} loading={loading} />
      </div>
    </Layout>
  );
};