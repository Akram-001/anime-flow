import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://w1.anime4up.tv/anime/";

async function scrapeAnime() {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const animeList = [];

  $(".anime-card").each((_, el) => {
    const title = $(el).find(".anime-card-title h3 a").text().trim();
    const image = $(el).find("img").attr("src");
    animeList.push({ title, image });
  });

  return animeList;
}

// ✅ هنا نصدّر النتيجة
const scrapedAnime = await scrapeAnime();
export default scrapedAnime;
