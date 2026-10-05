import { db } from "@/db";
import { books, chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const bookId = Number(id);

    const bookResult = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId));

    const chapterResult = await db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId));

    if (!bookResult[0]) {
      return Response.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    return Response.json({
      book: bookResult[0],
      chapters: chapterResult,
    });
  } catch (error) {
    console.error("Failed to fetch book:", error);

    return Response.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}