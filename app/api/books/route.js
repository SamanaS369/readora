import { db } from "@/db";
import { books } from "@/db/schema";

export async function GET() {
  try {
    const allBooks = await db.select().from(books);

    return Response.json(allBooks);
  } catch (error) {
    console.error("Failed to fetch books:", error);

    return Response.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}