import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AnimeCard } from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Clock } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Layout } from "@/components/Layout"; // ✅ استدعاء Layout

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
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  anime: Anime[];
  className?: string;
  loading?: boolean;
}

const AnimeSection = ({ title, icon, anime, className = "", loading }: SectionProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, "")}`);
    if (container) {
      const scrollAmount = 320;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-3xl font-bold gradient-text">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              disabled={scrollPosition === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ✅ لو لودينج نعرض Skeleton */}
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
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {anime.map((item, index) => (
              <div
                key={item.id}
                className="flex-none w-80 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AnimeCard anime={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);

    const fetchAnimes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "animes"));
        const list: Anime[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Anime);
        });
        setAnimes(list);
      } catch (error) {
        console.error("❌ خطأ في جلب الأنميات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  const trendingAnime = animes.filter((anime) => anime.isTrending);
  const newAnime = animes.filter((anime) => anime.isNew);
  const allAnime = animes;

  return (
    <Layout> {/* ✅ هنا أضفنا Layout */}
      <div
        className={`min-h-screen bg-gradient-hero transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroSection />

        <div className="relative z-10 bg-background/95 backdrop-blur-sm">
          <AnimeSection
            title="Trending Now"
            icon={<TrendingUp className="w-8 h-8 text-warning" />}
            anime={trendingAnime}
            loading={loading}
            className="border-t border-white/10"
          />

          <AnimeSection
            title="New Releases"
            icon={<Sparkles className="w-8 h-8 text-primary" />}
            anime={newAnime}
            loading={loading}
          />

          <AnimeSection
            title="Continue Watching"
            icon={<Clock className="w-8 h-8 text-secondary" />}
            anime={allAnime.slice(0, 4)}
            loading={loading}
          />

          <AnimeSection
            title="Top Rated"
            icon={<Sparkles className="w-8 h-8 text-accent" />}
            anime={allAnime}
            loading={loading}
          />
        </div>

        <div className="h-32 md:h-16" />
      </div>
    </Layout>
  );
};