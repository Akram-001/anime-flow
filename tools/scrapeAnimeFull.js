import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import { db } from "../src/lib/firebase.node.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

dotenv.config();

const BASE_URL = "https://anime4up.rest";

async function scrapePage(page = 1) {
  try {
    const url = `${BASE_URL}/anime/page/${page}/`;
    console.log(`📥 جاري جلب الصفحة ${page}: ${url}`);

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const $ = cheerio.load(data);
    const animeLinks = [];

    $(".anime-card a").each((_, el) => {
      const link = $(el).attr("href");
      if (link && !animeLinks.includes(link)) {
        animeLinks.push(link);
      }
    });

    return animeLinks;
  } catch (err) {
    console.error("❌ خطأ في جلب الصفحة:", err.message);
    return [];
  }
}

async function scrapeAnimeDetails(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);

    const title = $("h1.anime-details-title").text().trim();
    const description = $(".anime-details p").first().text().trim();
    const image = $(".anime-thumbnail img").attr("src");

    const genres = [];
    $(".anime-genres a").each((_, el) => {
      genres.push($(el).text().trim());
    });

    const episodes = [];
    $(".episodes-list a").each((_, el) => {
      episodes.push({
        title: $(el).text().trim(),
        url: $(el).attr("href"),
      });
    });

    return {
      title,
      description,
      image,
      genres,
      episodes,
      sourceUrl: url,
      createdAt: serverTimestamp(),
    };
  } catch (err) {
    console.error(`⚠️ خطأ في جلب بيانات ${url}:`, err.message);
    return null;
  }
}

async function scrapeAll() {
  let page = 1;
  let total = 0;

  while (true) {
    const animeLinks = await scrapePage(page);
    if (animeLinks.length === 0) break;

    for (const link of animeLinks) {
      const details = await scrapeAnimeDetails(link);
      if (details) {
        await addDoc(collection(db, "animes"), details);
        console.log(`✅ أُضيف: ${details.title}`);
        total++;
      }
    }

    page++;
    if (page > 2) break; // ⚠️ مؤقت (غيره إلى while(true) إذا تبغى كل الصفحات)
  }

  console.log(`🎉 خلصنا! المجموع: ${total} أنمي تم رفعه إلى Firestore ✅`);
}

scrapeAll();
