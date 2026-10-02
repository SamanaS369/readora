"use client";

import { useState } from "react";
import Link from "next/link";

const initialStories = [
  {
    id: 1,
    title: "A Letter From the Rain",
    author: "Emma Davis",
    category: "Romance",
    status: "Pending",
  },
  {
    id: 2,
    title: "The Hidden Door",
    author: "Daniel Smith",
    category: "Mystery",
    status: "Published",
  },
  {
    id: 3,
    title: "Beyond the Mountain",
    author: "Sophia Brown",
    category: "Adventure",
    status: "Pending",
  },
  {
    id: 4,
    title: "Memories of Yesterday",
    author: "Olivia Wilson",
    category: "Drama",
    status: "Published",
  },
  {
    id: 5,
    title: "The Forgotten City",
    author: "Noah Taylor",
    category: "Fantasy",
    status: "Pending",
  },
];

export default function AdminStoriesPage() {
  const [stories, setStories] = useState(initialStories);
  const [search, setSearch] = useState("");

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.author.toLowerCase().includes(search.toLowerCase()) ||
      story.category.toLowerCase().includes(search.toLowerCase())
  );

  const approveStory = (id) => {
    setStories(
      stories.map((story) =>
        story.id === id
          ? { ...story, status: "Published" }
          : story
      )
    );
  };

  const deleteStory = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this story?"
    );

    if (confirmed) {
      setStories(stories.filter((story) => story.id !== id));
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
                Manage Stories
              </h1>

              <p className="text-gray-500 mt-1">
                Review and manage community stories.
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
              className="text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              📚 Books
            </Link>

            <Link
              href="/admin/stories"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
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

        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Community Stories
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {stories.length} stories in the system
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

          <input
            type="text"
            placeholder="Search stories by title, author or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

        </div>

        {/* Stories Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Story
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Author
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Category
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

                {filteredStories.map((story) => (

                  <tr
                    key={story.id}
                    className="hover:bg-gray-50"
                  >

                    {/* Story */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-14 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">
                          ✍️
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            {story.title}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            ID: {story.id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Author */}
                    <td className="px-6 py-4 text-gray-600">
                      {story.author}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-gray-600">
                      {story.category}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          story.status === "Published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {story.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        {story.status === "Pending" && (
                          <button
                            onClick={() => approveStory(story.id)}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() =>
                            alert(
                              `Viewing "${story.title}" will be connected later.`
                            )
                          }
                          className="px-3 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                        >
                          View
                        </button>

                        <button
                          onClick={() => deleteStory(story.id)}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
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
          {filteredStories.length === 0 && (
            <div className="text-center py-12">

              <div className="text-4xl mb-3">
                ✍️
              </div>

              <h3 className="font-semibold text-gray-900">
                No stories found
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