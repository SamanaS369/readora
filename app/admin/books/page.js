"use client";

import { useState } from "react";
import Link from "next/link";

const initialBooks = [
  {
    id: 1,
    title: "The Silent Forest",
    author: "Maya Sharma",
    category: "Fiction",
    premium: false,
    status: "Published",
  },
  {
    id: 2,
    title: "Beyond the Stars",
    author: "Alex Carter",
    category: "Fantasy",
    premium: true,
    status: "Published",
  },
  {
    id: 3,
    title: "The Last Journey",
    author: "Sarah Wilson",
    category: "Adventure",
    premium: false,
    status: "Draft",
  },
  {
    id: 4,
    title: "Dreams of Tomorrow",
    author: "James Lee",
    category: "Romance",
    premium: true,
    status: "Published",
  },
  {
    id: 5,
    title: "Whispers in the Rain",
    author: "Emma Davis",
    category: "Mystery",
    premium: false,
    status: "Published",
  },
  {
    id: 6,
    title: "The Hidden Kingdom",
    author: "Daniel Smith",
    category: "Fantasy",
    premium: true,
    status: "Draft",
  },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase())
  );

  const deleteBook = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (confirmed) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-purple-600 font-semibold">
                READORA ADMIN
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Manage Books
              </h1>

              <p className="text-gray-500 mt-1">
                Add, edit and manage books on Readora.
              </p>
            </div>

            <Link
              href="/admin"
              className="text-purple-600 font-medium hover:underline"
            >
              ← Back to Dashboard
            </Link>

          </div>

        </div>
      </header>

      {/* Navigation */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">

          <nav className="flex flex-wrap gap-2 py-3">

            <Link
              href="/admin"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/books"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📚 Books
            </Link>

            <Link
              href="/admin/stories"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              ✍️ Stories
            </Link>

            <Link
              href="/admin/users"
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              👥 Users
            </Link>

          </nav>

        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">

        {/* Top Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              All Books
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {books.length} books in the system
            </p>
          </div>

          <button
            className="bg-purple-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-purple-700"
            onClick={() => alert("Add Book feature will be connected later.")}
          >
            + Add New Book
          </button>

        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

          <input
            type="text"
            placeholder="Search books by title, author or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

        </div>

        {/* Books Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Book
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Author
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Category
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {filteredBooks.map((book) => (

                  <tr
                    key={book.id}
                    className="hover:bg-gray-50"
                  >

                    {/* Book */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">
                          📖
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {book.title}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            ID: {book.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-gray-600">
                      {book.author}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-gray-600">
                      {book.category}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">

                      {book.premium ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Free
                        </span>
                      )}

                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          book.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {book.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          className="px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                          onClick={() =>
                            alert(`Edit "${book.title}" feature will be connected later.`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                          onClick={() => deleteBook(book.id)}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* No Results */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">

              <div className="text-4xl mb-3">
                📚
              </div>

              <h3 className="font-semibold text-gray-900">
                No books found
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Try searching with a different title, author or category.
              </p>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}