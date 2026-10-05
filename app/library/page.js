"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LibraryPage() {
  const router = useRouter();

  const [libraryBooks, setLibraryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        setError("");

        // Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        // If user is not logged in
        if (!user) {
          router.push("/login");
          return;
        }

        // Get books saved by this user
        const { data: libraryData, error: libraryError } =
          await supabase
            .from("library")
            .select("book_id, created_at")
            .eq("user_id", user.id);

        if (libraryError) {
          throw libraryError;
        }

        // No books in library
        if (!libraryData || libraryData.length === 0) {
          setLibraryBooks([]);
          return;
        }

        // Get book IDs
        const bookIds = libraryData.map((item) => item.book_id);

        // Get actual books
        const { data: booksData, error: booksError } =
          await supabase
            .from("books")
            .select("*")
            .in("id", bookIds);

        if (booksError) {
          throw booksError;
        }

        // Get reading progress
        const { data: progressData, error: progressError } =
          await supabase
            .from("reading_progress")
            .select("*")
            .eq("user_id", user.id);

        if (progressError) {
          console.warn(
            "Could not load reading progress:",
            progressError
          );
        }

        // Combine book + progress information
        const formattedBooks = (booksData || []).map((book) => {
          const progressRecord = (progressData || []).find(
            (progress) => progress.book_id === book.id
          );

          const progress = progressRecord
            ? Number(progressRecord.progress || 0)
            : 0;

          return {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category || "Uncategorized",
            progress: progress,
            status:
              progress >= 100
                ? "Completed"
                : "Currently Reading",
            cover_url: book.cover_url,
          };
        });

        setLibraryBooks(formattedBooks);
      } catch (err) {
        console.error("Library error:", err);
        setError(
          err.message || "Failed to load your library."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-purple-50 py-12">
          <div className="max-w-7xl mx-auto px-6">

            <h1 className="text-4xl font-bold text-gray-900">
              My Library
            </h1>

            <p className="text-gray-600 mt-2">
              Your books, reading progress, and reading history.
            </p>

          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-10">

          <div className="bg-white border rounded-xl p-8 text-center">

            <p className="text-gray-500">
              Loading your library...
            </p>

          </div>

        </section>

      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-purple-50 py-12">
          <div className="max-w-7xl mx-auto px-6">

            <h1 className="text-4xl font-bold text-gray-900">
              My Library
            </h1>

            <p className="text-gray-600 mt-2">
              Your books, reading progress, and reading history.
            </p>

          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-10">

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">

            <p className="text-red-600">
              {error}
            </p>

          </div>

        </section>

      </main>
    );
  }

  const currentlyReading = libraryBooks.filter(
    (book) => book.status === "Currently Reading"
  );

  const completedBooks = libraryBooks.filter(
    (book) => book.status === "Completed"
  );

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-purple-50 py-12">

        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-4xl font-bold text-gray-900">
            My Library
          </h1>

          <p className="text-gray-600 mt-2">
            Your books, reading progress, and reading history.
          </p>

        </div>

      </section>

      {/* Library */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Currently Reading */}
        <div className="mb-12">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Currently Reading
          </h2>

          {currentlyReading.length === 0 ? (

            <div className="bg-white border rounded-xl p-8 text-center">

              <div className="text-5xl mb-4">
                📖
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                No books currently being read
              </h3>

              <p className="text-gray-500 mt-2">
                Add a book to your library and start reading.
              </p>

              <Link
                href="/books"
                className="inline-block mt-5 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
              >
                Explore Books
              </Link>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {currentlyReading.map((book) => (

                <div
                  key={book.id}
                  className="bg-white border rounded-xl p-5 shadow-sm"
                >

                  <div className="flex gap-5">

                    {/* Cover */}
                    <div className="w-28 h-36 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">

                      {book.cover_url ? (

                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <span className="text-4xl">
                          📖
                        </span>

                      )}

                    </div>

                    {/* Details */}
                    <div className="flex-1">

                      <h3 className="text-xl font-bold text-gray-900">
                        {book.title}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        By {book.author}
                      </p>

                      <p className="text-sm text-purple-600 mt-2">
                        {book.category}
                      </p>

                      {/* Progress */}
                      <div className="mt-5">

                        <div className="flex justify-between text-sm mb-2">

                          <span className="text-gray-500">
                            Reading Progress
                          </span>

                          <span className="font-medium">
                            {book.progress}%
                          </span>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">

                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                Math.max(book.progress, 0),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      <Link
                        href={`/reader/${book.id}`}
                        className="inline-block mt-5 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        Continue Reading
                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Reading History */}
        <div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reading History
          </h2>

          {completedBooks.length === 0 ? (

            <div className="bg-white border rounded-xl p-8 text-center">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h3 className="text-xl font-semibold text-gray-900">
                No completed books yet
              </h3>

              <p className="text-gray-500 mt-2">
                Books you finish reading will appear here.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {completedBooks.map((book) => (

                <div
                  key={book.id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm"
                >

                  {/* Cover */}
                  <div className="h-48 bg-purple-100 flex items-center justify-center overflow-hidden">

                    {book.cover_url ? (

                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <span className="text-6xl">
                        📖
                      </span>

                    )}

                  </div>

                  {/* Details */}
                  <div className="p-5">

                    <h3 className="text-xl font-bold text-gray-900">
                      {book.title}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      By {book.author}
                    </p>

                    <div className="flex justify-between items-center mt-4">

                      <span className="text-sm text-green-600 font-medium">
                        ✓ Completed
                      </span>

                      <Link
                        href={`/books/${book.id}`}
                        className="text-purple-600 hover:underline"
                      >
                        View Book
                      </Link>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}