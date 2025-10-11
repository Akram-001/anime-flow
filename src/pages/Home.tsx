import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Fire, Star, Clock } from "lucide-react";
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

interface SectionProps {
  title: string;
  anime: Anime[];
  loading?: boolean;
}

const AnimeSection = ({ title, anime, loading }: SectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (dir: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const amount = 350;
    const newPos = dir === "left" ? Math.max(0, scrollPos - amount) : Math.min(container.scrollWidth - container.clientWidth, scrollPos + amount);
    container.scrollTo({ left: newPos, behavior: "smooth" });
    setScrollPos(newPos);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => setScrollPos(container.scrollLeft);
    container.addEventListener("scroll", handler);
    return () => container.removeEventListener("scroll", handler);
  }, []);

  return (
    <section className="my-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => scroll("left")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => scroll("right")}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-64 h-80 bg-gray-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : anime.length > 0 ? (
        <div ref={containerRef} className="flex gap-4 overflow-x-auto scrollbar-hide">
          {anime.map((item) => (
            <AnimeCard key={item.id} anime={item} className="w-64 hover:scale-105 transition-transform duration-300" />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-6">No anime found.</p>
      )}
    </section>
  );
};

export const Home = () => {
  const [loading, setLoading] = useState(true);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [latest, setLatest] = useState<Anime | null>(null);

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

        if (list.length === 0) toast("No anime found.", { description: "Try again later.", duration: 3000 });

        setAnimes(list);
        setLatest(list[0] || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch animes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  const trending = animes.filter((a) => a.isTrending);
  const newReleases = animes.filter((a) => a.isNew);
  const popular = animes.filter((a) => a.rating && a.rating >= 8);
  const topRated = animes.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
        {latest && (
          <div
            className="relative h-[450px] md:h-[600px] w-full bg-cover bg-center flex items-end p-6"
            style={{ backgroundImage: `url(${latest.image})` }}
          >
            <div className="bg-black/50 p-4 rounded-lg max-w-xl">
              <h1 className="text-3xl md:text-5xl font-bold">{latest.title}</h1>
              <p className="mt-2 text-sm md:text-base">{latest.genre || "Genre unknown"}</p>
              <Button variant="hero" className="mt-4">
                Watch Now
              </Button>
            </div>
          </div>
        )}

        <div className="px-6 md:px-12 py-8">
          <AnimeSection title="Trending Now" anime={trending} loading={loading} />
          <AnimeSection title="New Releases" anime={newReleases} loading={loading} />
          <AnimeSection title="Popular" anime={popular} loading={loading} />
          <AnimeSection title="Top Rated" anime={topRated} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};