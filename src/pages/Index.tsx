import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";

interface Anime {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  featured?: boolean;
}

const Index = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) return <p className="text-center mt-10">⏳ جاري تحميل الأنميات...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📺 قائمة الأنميات</h1>

      {animes.length === 0 ? (
        <p className="text-gray-500">⚠️ لا يوجد أنميات مضافة حالياً</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {animes.map((anime) => (
            <Link key={anime.id} to={`/anime/${anime.id}`}>
              <div className="p-3 border rounded-xl shadow hover:shadow-lg transition">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <h2 className="text-lg font-semibold mt-2">{anime.title}</h2>
                {anime.category && (
                  <span className="text-sm text-gray-500">{anime.category}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;