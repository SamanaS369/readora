import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { categories } from "./schema.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

const sampleCategories = [
  { name: "Fiction" },
  { name: "Fantasy" },
  { name: "Adventure" },
  { name: "Romance" },
  { name: "Mystery" },
  { name: "Science Fiction" },
];

try {
  await db.insert(categories).values(sampleCategories);

  console.log("Categories inserted successfully!");
} catch (error) {
  console.error("Failed to insert categories:", error);
} finally {
  await client.end();
}