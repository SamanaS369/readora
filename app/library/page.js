"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LibraryPage() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryStories, setLibraryStories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLibrary();
  }, []);

  async function fetchLibrary() {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------
      // 1. GET CURRENT USER
      // --------------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User error:", userError);
        throw new Error(userError.message);
      }

      if (!user) {
        setLibraryBooks([]);
        setLibraryStories([]);
        setError("Please login to view your library.");
        return;
      }

      console.log("Logged in user:", user.id);

      // --------------------------------------------------
      // 2. GET LIBRARY ITEMS
      // --------------------------------------------------

      const {
        data: libraryData,
        error: libraryError,
      } = await supabase
        .from("library")
        .select("id, user_id, book_id, story_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (libraryError) {
        console.error(
          "Supabase library error:",
          libraryError
        );

        console.error(
          "Library error message:",
          libraryError?.message
        );

        console.error(
          "Library error details:",
          libraryError?.details
        );

        console.error(
          "Library error hint:",
          libraryError?.hint
        );

        throw new Error(
          libraryError.message ||
            libraryError.details ||
            "Failed to load library."
        );
      }

      console.log(
        "Library rows:",
        libraryData
      );

      if (!libraryData || libraryData.length === 0) {
        setLibraryBooks([]);
        setLibraryStories([]);
        return;
      }

      // --------------------------------------------------
      // 3. SEPARATE BOOKS AND STORIES
      // --------------------------------------------------

      const bookIds = libraryData
        .filter(
          (item) =>
            item.book_id !== null &&
            item.book_id !== undefined
        )
        .map((item) => Number(item.book_id));

      const storyIds = libraryData
        .filter(
          (item) =>
            item.story_id !== null &&
            item.story_id !== undefined
        )
        .map((item) => Number(item.story_id));

      console.log("Book IDs:", bookIds);
      console.log("Story IDs:", storyIds);

      // --------------------------------------------------
      // 4. FETCH BOOKS
      // --------------------------------------------------

      let books = [];

      if (bookIds.length > 0) {
        const {
          data: booksData,
          error: booksError,
        } = await supabase
          .from("books")
          .select(`
            id,
            title,
            author,
            description,
            cover_url,
            is_premium
          `)
          .in("id", bookIds);

        if (booksError) {
          console.error(
            "Books error:",
            booksError
          );

          throw new Error(
            booksError.message ||
              "Failed to load books."
          );
        }

        books = booksData || [];
      }

      // --------------------------------------------------
      // 5. FETCH COMMUNITY STORIES
      // --------------------------------------------------

      let stories = [];

      if (storyIds.length > 0) {
        const {
          data: storiesData,
          error: storiesError,
        } = await supabase
          .from("stories")
          .select(`
            id,
            title,
            content,
            cover_url,
            user_id,
            category_id,
            created_at,
            status
          `)
          .in("id", storyIds)
          .eq("status", "published");

        if (storiesError) {
          console.error(
            "Stories error:",
            storiesError
          );

          throw new Error(
            storiesError.message ||
              "Failed to load community stories."
          );
        }

        stories = storiesData || [];
      }

      // --------------------------------------------------
      // 6. GET AUTHORS FOR STORIES
      // --------------------------------------------------

      const authorIds = [
        ...new Set(
          stories
            .map((story) => story.user_id)
            .filter(Boolean)
        ),
      ];

      let authors = [];

      if (authorIds.length > 0) {
        const {
          data: authorsData,
          error: authorsError,
        } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        if (authorsError) {
          console.error(
            "Authors error:",
            authorsError
          );
        } else {
          authors = authorsData || [];
        }
      }

      // --------------------------------------------------
      // 7. FORMAT BOOKS
      // --------------------------------------------------

      const formattedBooks = books.map(
        (book) => ({
          ...book,
          type: "book",
        })
      );

      // --------------------------------------------------
      // 8. FORMAT STORIES
      // --------------------------------------------------

      const formattedStories = stories.map(
        (story) => {
          const author = authors.find(
            (item) =>
              item.id === story.user_id
          );

          return {
            ...story,
            type: "story",
            authorName:
              author?.name ||
              "Anonymous",
          };
        }
      );

      setLibraryBooks(
        formattedBooks
      );

      setLibraryStories(
        formattedStories
      );

      console.log(
        "Formatted books:",
        formattedBooks
      );

      console.log(
        "Formatted stories:",
        formattedStories
      );
    } catch (err) {
      console.error(
        "Library error:",
        err
      );

      console.error(
        "Library error message:",
        err?.message
      );

      setError(
        err?.message ||
          "Failed to load your library."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // REMOVE FROM LIBRARY
  // --------------------------------------------------

  async function removeBook(bookId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("library")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (error) {
        console.error(
          "Remove book error:",
          error
        );

        alert(
          error.message ||
            "Could not remove book."
        );

        return;
      }

      setLibraryBooks((prev) =>
        prev.filter(
          (book) =>
            book.id !== bookId
        )
      );
    } catch (err) {
      console.error(
        "Remove book error:",
        err
      );
    }
  }

  async function removeStory(storyId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("library")
        .delete()
        .eq("user_id", user.id)
        .eq("story_id", storyId);

      if (error) {
        console.error(
          "Remove story error:",
          error
        );

        alert(
          error.message ||
            "Could not remove story."
        );

        return;
      }

      setLibraryStories((prev) =>
        prev.filter(
          (story) =>
            story.id !== storyId
        )
      );
    } catch (err) {
      console.error(
        "Remove story error:",
        err
      );
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            📚
          </div>

          <p className="text-gray-600">
            Loading your library...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // NOT LOGGED IN / ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">

          <Link
            href="/books"
            className="text-purple-600 hover:underline"
          >
            ← Back to Books
          </Link>

          <div className="bg-white border border-red-200 rounded-2xl p-8 mt-8">
            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Could not load your library
            </h1>

            <p className="text-red-600 mt-3">
              {error}
            </p>

            <button
              onClick={fetchLibrary}
              className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>

        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // EMPTY LIBRARY
  // --------------------------------------------------

  const isEmpty =
    libraryBooks.length === 0 &&
    libraryStories.length === 0;

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-gray-50">

        <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-6 py-12">

            <h1 className="text-4xl font-bold">
              📚 My Library
            </h1>

            <p className="text-purple-100 mt-3">
              Your saved books and community stories
              will appear here.
            </p>

          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-16 text-center">

          <div className="text-7xl mb-6">
            📖
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Your library is empty
          </h2>

          <p className="text-gray-500 mt-3">
            Browse Readora and add books or stories
            to your library.
          </p>

          <Link
            href="/books"
            className="inline-block mt-7 bg-purple-600 text-white px-7 py-3 rounded-lg hover:bg-purple-700"
          >
            Explore Books
          </Link>

        </div>

      </main>
    );
  }

  // --------------------------------------------------
  // MAIN LIBRARY
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">

        <div className="max-w-6xl mx-auto px-6 py-12">

          <h1 className="text-4xl font-bold">
            📚 My Library
          </h1>

          <p className="text-purple-100 mt-3">
            Books and community stories you saved.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">

            <div className="bg-white/10 rounded-lg px-5 py-3">
              <span className="font-bold text-xl">
                {libraryBooks.length}
              </span>

              <span className="ml-2 text-purple-100">
                Books
              </span>
            </div>

            <div className="bg-white/10 rounded-lg px-5 py-3">
              <span className="font-bold text-xl">
                {libraryStories.length}
              </span>

              <span className="ml-2 text-purple-100">
                Stories
              </span>
            </div>

          </div>

        </div>

      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* BOOKS */}
        {libraryBooks.length > 0 && (
          <section>

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📖 Saved Books
                </h2>

                <p className="text-gray-500 mt-1">
                  Books you added to your library.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {libraryBooks.map(
                (book) => (
                  <div
                    key={`book-${book.id}`}
                    className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >

                    {/* COVER */}
                    <div className="h-64 bg-gray-100">

                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          📖
                        </div>
                      )}

                    </div>

                    {/* CONTENT */}
                    <div className="p-5">

                      {book.is_premium && (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mb-2">
                          👑 Premium
                        </span>
                      )}

                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        By {book.author}
                      </p>

                      <div className="flex gap-2 mt-5">

                        <Link
                          href={`/books/${book.id}`}
                          className="flex-1 text-center bg-purple-600 text-white px-3 py-2.5 rounded-lg hover:bg-purple-700"
                        >
                          Read
                        </Link>

                        <button
                          onClick={() =>
                            removeBook(
                              book.id
                            )
                          }
                          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          title="Remove from library"
                        >
                          🗑️
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* STORIES */}
        {libraryStories.length > 0 && (
          <section
            className={
              libraryBooks.length > 0
                ? "mt-14"
                : ""
            }
          >

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-gray-900">
                ✍️ Saved Community Stories
              </h2>

              <p className="text-gray-500 mt-1">
                Stories written and published by the
                Readora community.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {libraryStories.map(
                (story) => (
                  <div
                    key={`story-${story.id}`}
                    className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                  >

                    {/* COVER */}
                    <div className="h-64 bg-gradient-to-br from-purple-100 to-indigo-100">

                      {story.cover_url ? (
                        <img
                          src={story.cover_url}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          ✍️
                        </div>
                      )}

                    </div>

                    {/* CONTENT */}
                    <div className="p-5">

                      <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mb-2">
                        ✍️ Community Story
                      </span>

                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {story.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        By {story.authorName}
                      </p>

                      <div className="flex gap-2 mt-5">

                        <Link
                          href={`/stories/${story.id}`}
                          className="flex-1 text-center bg-purple-600 text-white px-3 py-2.5 rounded-lg hover:bg-purple-700"
                        >
                          Read
                        </Link>

                        <button
                          onClick={() =>
                            removeStory(
                              story.id
                            )
                          }
                          className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          title="Remove from library"
                        >
                          🗑️
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

      </div>

    </main>
  );
}