"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [externalBooks, setExternalBooks] = useState([]);

  const [search, setSearch] = useState("");
  const [externalSearch, setExternalSearch] = useState("fiction");

  const [loading, setLoading] = useState(true);
  const [externalLoading, setExternalLoading] = useState(false);

  // Fetch Readora books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();

        if (response.ok) {
          setBooks(data);
        }
      } catch (error) {
        console.error("Failed to fetch Readora books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch Open Library books
  const fetchExternalBooks = async (query = "fiction") => {
    setExternalLoading(true);

    try {
      const response = await fetch(
        `/api/external-books?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (response.ok) {
        setExternalBooks(data);
      }
    } catch (error) {
      console.error("Failed to fetch external books:", error);
    } finally {
      setExternalLoading(false);
    }
  };

  // Load initial external books
  useEffect(() => {
    fetchExternalBooks("fiction");
  }, []);

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText)
    );
  });

  const handleExternalSearch = (e) => {
    e.preventDefault();

    if (!externalSearch.trim()) return;

    fetchExternalBooks(externalSearch);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* ========================= */}
        {/* READORA BOOKS */}
        {/* ========================= */}

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Explore Books
          </h1>

          <p className="text-gray-600 mt-2">
            Discover books available on Readora.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search Readora books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white mb-10"
        />

        {loading ? (
          <p className="text-gray-500">Loading Readora books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-gray-500">No Readora books found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition"
              >
                <div className="h-52 bg-purple-100 flex items-center justify-center">
                  <span className="text-5xl">📖</span>
                </div>

                <div className="p-6">

                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {book.title}
                    </h2>

                    {book.isPremium && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 mt-2">
                    By {book.author}
                  </p>

                  {book.description && (
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                      {book.description}
                    </p>
                  )}

                  <Link
                    href={`/books/${book.id}`}
                    className="block text-center bg-purple-600 text-white py-2 rounded-lg mt-5 hover:bg-purple-700"
                  >
                    View Book
                  </Link>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* ========================= */}
        {/* EXTERNAL BOOKS */}
        {/* ========================= */}

        <section className="mt-20">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Explore Free Books
            </h2>

            <p className="text-gray-600 mt-2">
              Discover books from Open Library.
            </p>
          </div>

          {/* External Search */}

          <form
            onSubmit={handleExternalSearch}
            className="flex flex-col sm:flex-row gap-3 mb-10"
          >
            <input
              type="text"
              placeholder="Search books..."
              value={externalSearch}
              onChange={(e) => setExternalSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white"
            />

            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Search
            </button>
          </form>

          {externalLoading ? (
            <p className="text-gray-500">
              Searching Open Library...
            </p>
          ) : externalBooks.length === 0 ? (
            <p className="text-gray-500">
              No external books found.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {externalBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden"
                >

                  {/* Cover */}

                  <div className="h-64 bg-gray-100 flex items-center justify-center">

                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">📚</span>
                    )}

                  </div>

                  {/* Book information */}

                  <div className="p-5">

                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      {book.author}
                    </p>

                    {book.publishYear && (
                      <p className="text-xs text-gray-400 mt-1">
                        Published: {book.publishYear}
                      </p>
                    )}

                    {book.hasFulltext && (
                      <span className="inline-block mt-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Available to read
                      </span>
                    )}

                    <a
                      href={`https://openlibrary.org${book.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center border border-purple-600 text-purple-600 py-2 rounded-lg mt-4 hover:bg-purple-50"
                    >
                      View on Open Library
                    </a>

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}