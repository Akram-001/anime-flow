import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Play, Heart, Download, Star, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Anime {
  id: string;
  title: string;
  description: string;
  image: string;
  banner?: string;
  rating?: number;
  year?: number;
  status?: string;
  episodes?: number;
  duration?: string;
  studio?: string;
  genres?: string[];
  season?: string;
  aired?: string;
}

interface Episode {
  id: string;
  title: string;
  number: number;
  duration?: string;
  videoUrl?: string;
}

export const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        if (!id) return;

        // 🎬 بيانات الأنمي
        const docRef = doc(db, "animes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAnime({ id: docSnap.id, ...docSnap.data() } as Anime);
        }

        // 🎞️ الحلقات (ساب-كولكشن)
        const epsRef = collection(db, "animes", id, "episodes");
        const epsSnap = await getDocs(epsRef);
        const epsList: Episode[] = [];
        epsSnap.forEach((d) => {
          epsList.push({ id: d.id, ...(d.data() as any) });
        });

        // ترتيب حسب رقم الحلقة (اختياري)
        epsList.sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
        setEpisodes(epsList);
      } catch (error) {
        console.error("❌ خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ جاري تحميل التفاصيل...</p>;
  if (!anime) return <p className="text-center mt-10 text-red-500">⚠️ الأنمي غير موجود</p>;

  const goToFirstEpisode = () => {
    if (!id || episodes.length === 0) return;
    navigate(`/anime/${id}/watch/${episodes[0].id}`);
  };

  return (
    <Layout>
      <div className="pb-24 md:pb-8">
        {/* Hero Banner */}
        <div
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.banner || anime.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-float"
                />
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres?.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{anime.rating ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{anime.year ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{anime.episodes ?? episodes.length} episodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{anime.duration ?? "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1 md:flex-none"
                  onClick={goToFirstEpisode}
                  disabled={episodes.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Button>
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="lg"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download (VIP)
                </Button>
              </div>

              {/* Description */}
              <Card className="glass border-primary/20 p-6">
                <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{anime.description}</p>
              </Card>

              {/* Episodes */}
              <Card className="glass border-primary/20 p-6">
                <h2 className="text-xl font-semibold mb-4">Episodes</h2>
                <div className="space-y-3">
                  {episodes.length > 0 ? (
                    episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <div className="w-12 h-8 rounded bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium">{episode.number}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{episode.title}</h3>
                          <p className="text-sm text-muted-foreground">{episode.duration || ""}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => navigate(`/anime/${id}/watch/${episode.id}`)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">🚫 لا توجد حلقات مضافة بعد</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass border-primary/20 p-6">
                <h3 className="text-lg font-semibold mb-4">Information</h3>
                <div className="space-y-3">
                  <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium">{anime.status ?? "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Studio</p><p className="font-medium">{anime.studio ?? "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Aired</p><p className="font-medium">{anime.aired ?? "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Season</p><p className="font-medium">{anime.season ?? "-"}</p></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};