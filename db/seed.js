import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { books } from "./schema.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const sampleBooks = [
  {
    title: "The Silent Forest",
    author: "Maya Sharma",
    description:
      "A mysterious journey into a quiet forest filled with secrets.",
    categoryId: null,
    coverUrl: null,
    isPremium: false,
    status: "published",
  },
  {
    title: "Beyond the Stars",
    author: "Alex Carter",
    description:
      "An adventurous fantasy story that takes readers beyond the stars.",
    categoryId: null,
    coverUrl: null,
    isPremium: true,
    status: "published",
  },
  {
    title: "The Last Journey",
    author: "Sarah Wilson",
    description:
      "A powerful adventure about courage, friendship, and one final journey.",
    categoryId: null,
    coverUrl: null,
    isPremium: false,
    status: "published",
  },
  {
    title: "Dreams of Tomorrow",
    author: "James Lee",
    description:
      "A romantic story about dreams, choices, and unexpected connections.",
    categoryId: null,
    coverUrl: null,
    isPremium: true,
    status: "published",
  },
  {
    title: "Whispers in the Rain",
    author: "Emma Davis",
    description:
      "A mysterious story where every sound in the rain hides a secret.",
    categoryId: null,
    coverUrl: null,
    isPremium: false,
    status: "published",
  },
  {
    title: "The Hidden Kingdom",
    author: "Daniel Smith",
    description:
      "A fantasy adventure into a hidden kingdom waiting to be discovered.",
    categoryId: null,
    coverUrl: null,
    isPremium: true,
    status: "published",
  },
];

try {
  await db.insert(books).values(sampleBooks);

  console.log("Books inserted successfully!");
} catch (error) {
  console.error("Failed to insert books:", error);
} finally {
  await client.end();
}