import Link from "next/link";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import AddToLibraryButton from "@/components/AddToLibraryButton";

export default async function BookDetails({ params }) {
  const { id } = await params;

  const bookId = Number(id);

  // Check whether the ID is valid
  if (!Number.isInteger(bookId)) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Invalid Book ID
          </h1>

          <p className="text-gray-500 mt-3">
            The book ID received was: {id}
          </p>

          <Link
            href="/books"
            className="inline-block mt-5 bg-purple-600 text-white px-5 py-2 rounded-lg"
          >
            Back to Books
          </Link>
        </div>
      </main>
    );
  }

  const result = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId));

  const book = result[0];

  if (!book) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Book Not Found
          </h1>

          <Link
            href="/books"
            className="inline-block mt-5 bg-purple-600 text-white px-5 py-2 rounded-lg"
          >
            Back to Books
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <Link
          href="/books"
          className="text-purple-600 hover:underline"
        >
          ← Back to Books
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border mt-6 p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="h-80 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-7xl">📖</span>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl font-bold text-gray-900">
                  {book.title}
                </h1>

                {book.isPremium && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    Premium
                  </span>
                )}
              </div>

              <p className="text-lg text-gray-500 mt-3">
                By {book.author}
              </p>

              <p className="text-gray-700 leading-7 mt-6">
                {book.description || "No description available."}
              </p>

              <div className="flex gap-4 mt-8">
                <Link
                  href={`/reader/${book.id}`}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                >
                  Read Now
                </Link>

                <AddToLibraryButton bookId={book.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}