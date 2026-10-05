import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { chapters } from "./schema.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const sampleChapters = [
  {
    bookId: 1,
    chapterNumber: 1,
    title: "The Beginning",
    content:
      "Maya had always heard stories about the silent forest. People in her village said that no one should enter it after sunset. One morning, curiosity finally won. She packed a small bag and walked toward the forest.",
  },
  {
    bookId: 1,
    chapterNumber: 2,
    title: "Into the Forest",
    content:
      "The deeper Maya walked, the quieter everything became. There were no birds, no insects, and barely any wind. Suddenly, she noticed a strange old path hidden beneath the trees.",
  },
  {
    bookId: 1,
    chapterNumber: 3,
    title: "The Secret",
    content:
      "At the end of the path, Maya discovered an old wooden door covered with vines. She slowly opened it and found a room filled with mysterious books and maps. The forest had been hiding a secret for many years.",
  },

  {
    bookId: 2,
    chapterNumber: 1,
    title: "A New World",
    content:
      "Alex looked through the telescope and saw something that should not have been there. A bright blue planet appeared beyond the stars. That night changed everything.",
  },
  {
    bookId: 2,
    chapterNumber: 2,
    title: "Beyond the Stars",
    content:
      "The journey beyond the stars was difficult, but Alex refused to turn back. When the spacecraft finally reached the mysterious planet, a world unlike anything on Earth appeared before him.",
  },
];

try {
  await db.insert(chapters).values(sampleChapters);

  console.log("Chapters inserted successfully!");
} catch (error) {
  console.error("Failed to insert chapters:", error);
} finally {
  await client.end();
}