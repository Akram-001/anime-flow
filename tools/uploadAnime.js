import scrapedAnime from "./scrapeAnime.js";
import { db } from "../src/lib/firebase.node.js"; // ✅ بدل firebase.ts
import { collection, addDoc } from "firebase/firestore";

async function uploadAnime() {
  try {
    for (const anime of scrapedAnime) {
      await addDoc(collection(db, "animes"), anime);
      console.log(`✅ Added: ${anime.title}`);
    }
    console.log("🎉 All anime uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading anime:", error);
  }
}

uploadAnime();
