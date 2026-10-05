import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = postgres(process.env.DATABASE_URL, {
  max: 1,
});

const db = drizzle(client);

try {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });

  console.log("Migration completed successfully!");
} catch (error) {
  console.error("Migration failed:", error);
} finally {
  await client.end();
}