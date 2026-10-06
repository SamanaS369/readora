import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { db } = await import("./index.js");
const { books, chapters } = await import("./schema.js");
const { eq } = await import("drizzle-orm");

const BOOK_URL =
  "https://www.gutenberg.org/files/1342/1342-0.txt";

async function importBook() {
  try {
    console.log("Downloading Pride and Prejudice...");

    const response = await fetch(BOOK_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to download book: ${response.status}`
      );
    }

    let text = await response.text();

    console.log("Book downloaded.");

    // Remove Project Gutenberg header/footer
    const startMarker =
      "*** START OF THE PROJECT GUTENBERG EBOOK 1342 ***";

    const endMarker =
      "*** END OF THE PROJECT GUTENBERG EBOOK 1342 ***";

    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);

    if (start !== -1) {
      text = text.slice(start + startMarker.length);
    }

    if (end !== -1) {
      text = text.slice(0, end);
    }

    text = text.trim();

    // Check if book already exists
    const existingBook = await db
      .select()
      .from(books)
      .where(eq(books.title, "Pride and Prejudice"));

    if (existingBook.length > 0) {
      console.log(
        "Pride and Prejudice already exists in the database."
      );
      return;
    }

    // Insert book
    const insertedBook = await db
      .insert(books)
      .values({
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description:
          "A classic novel by Jane Austen.",
        coverUrl:
          "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        isPremium: false,
        status: "published",
      })
      .returning();

    const book = insertedBook[0];

    console.log(`Book created. ID: ${book.id}`);

    // Find chapters
    const chapterRegex =
      /(?:^|\n)\s*CHAPTER\s+([IVXLCDM]+)\.?\s*\n/gi;

    const matches = [...text.matchAll(chapterRegex)];

    console.log(`Found ${matches.length} chapters.`);

    if (matches.length === 0) {
      throw new Error("No chapters found.");
    }

    const chapterRows = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];

      const chapterNumber = i + 1;

      const startIndex =
        match.index + match[0].length;

      const endIndex =
        i + 1 < matches.length
          ? matches[i + 1].index
          : text.length;

      const chapterContent = text
        .slice(startIndex, endIndex)
        .trim();

      chapterRows.push({
        bookId: book.id,
        chapterNumber,
        title: `Chapter ${chapterNumber}`,
        content: chapterContent,
      });
    }

    await db.insert(chapters).values(chapterRows);

    console.log("");
    console.log("=================================");
    console.log("BOOK IMPORTED SUCCESSFULLY!");
    console.log("=================================");
    console.log(`Title: ${book.title}`);
    console.log(`Author: ${book.author}`);
    console.log(`Book ID: ${book.id}`);
    console.log(`Chapters: ${chapterRows.length}`);
    console.log("=================================");
  } catch (error) {
    console.error("Import failed:", error);
  }
}

importBook();