import fetch from "node-fetch";
import admin from "firebase-admin";
import { readFileSync } from "fs";

// 1. إعداد Firebase Admin SDK
const serviceAccount = JSON.parse(readFileSync(
  "./flow-app-81c0c-firebase-adminsdk-fbsvc-b7240c63d1.json", "utf8"
));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "flow-app-81c0c.appspot.com",
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// 2. استعلام AniList GraphQL لجلب بيانات الأنمي
const aniListQuery = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji english }
        description(asHtml: false)
        episodes
        coverImage { large }
      }
    }
  }
`;

async function fetchAnimes(page = 1, perPage = 5) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: aniListQuery, variables: { page, perPage } }),
  });
  const json = await res.json();
  return json.data.Page.media;
}

// 3. رفع الصورة إلى Storage
async function uploadCover(url, id) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const file = bucket.file(`covers/${id}.jpg`);
  await file.save(buffer, { contentType: "image/jpeg" });
  return `https://storage.googleapis.com/${bucket.name}/covers/${id}.jpg`;
}

// 4. جلب حلقات ورابطاتها عبر JAnime API (يستند إلى GogoAnime)
async function fetchEpisodeLinks(gogoId) {
  const apiUrl = `https://api.enime.moe/anime/${gogoId}`; // أو استخدم JAnime endpoints
  const res = await fetch(apiUrl);
  const json = await res.json();
  if (json.episodes) {
    return json.episodes.map(ep => ({
      number: ep.number,
      url: ep.url,
    }));
  }
  return [];
}

// 5. التشغيل: جمع بيانات ورفعها
(async () => {
  const animes = await fetchAnimes(1, 5); // جلب أول 5 أنميات
  for (const anime of animes) {
    try {
      const coverUrl = await uploadCover(anime.coverImage.large, anime.id);
      // اختبار: استخدم عنوان الأنمي أو ID كمفتاح للبحث في JAnime
      const episodeLinks = await fetchEpisodeLinks(anime.id);

      await db.collection("animes").doc(anime.id.toString()).set({
        title: anime.title.english || anime.title.romaji,
        description: anime.description,
        episodes: anime.episodes || 0,
        cover: coverUrl,
        episodesList: episodeLinks,
      });

      console.log(`✅ تم رفع الأنمي: ${anime.title.romaji}`);
    } catch (err) {
      console.error(`❌ خطأ في رفع ${anime.title.romaji}:`, err.message);
    }
  }

  console.log("🎉 تم رفع كل الأنميات بالحلقات وروابطها!");
})();
