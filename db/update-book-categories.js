import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { books, categories } from "./schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

try {
  const allCategories = await db.select().from(categories);

  const categoryMap = {};

  allCategories.forEach((category) => {
    categoryMap[category.name] = category.id;
  });

  await db
    .update(books)
    .set({ categoryId: categoryMap["Fiction"] })
    .where(eq(books.title, "The Silent Forest"));

  await db
    .update(books)
    .set({ categoryId: categoryMap["Fantasy"] })
    .where(eq(books.title, "Beyond the Stars"));

  await db
    .update(books)
    .set({ categoryId: categoryMap["Adventure"] })
    .where(eq(books.title, "The Last Journey"));

  await db
    .update(books)
    .set({ categoryId: categoryMap["Romance"] })
    .where(eq(books.title, "Dreams of Tomorrow"));

  await db
    .update(books)
    .set({ categoryId: categoryMap["Mystery"] })
    .where(eq(books.title, "Whispers in the Rain"));

  await db
    .update(books)
    .set({ categoryId: categoryMap["Fantasy"] })
    .where(eq(books.title, "The Hidden Kingdom"));

  console.log("Book categories updated successfully!");
} catch (error) {
  console.error("Failed to update book categories:", error);
} finally {
  await client.end();
}