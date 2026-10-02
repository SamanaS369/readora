import Link from "next/link";

const statistics = [
  {
    title: "Total Users",
    value: "1,248",
    icon: "👥",
    change: "+12%",
  },
  {
    title: "Total Books",
    value: "356",
    icon: "📚",
    change: "+8%",
  },
  {
    title: "Community Stories",
    value: "842",
    icon: "✍️",
    change: "+18%",
  },
  {
    title: "Premium Users",
    value: "186",
    icon: "⭐",
    change: "+15%",
  },
];

const recentBooks = [
  {
    id: 1,
    title: "The Silent Forest",
    author: "Maya Sharma",
    category: "Fiction",
    status: "Published",
  },
  {
    id: 2,
    title: "Beyond the Stars",
    author: "Alex Carter",
    category: "Fantasy",
    status: "Published",
  },
  {
    id: 3,
    title: "The Last Journey",
    author: "Sarah Wilson",
    category: "Adventure",
    status: "Draft",
  },
  {
    id: 4,
    title: "Dreams of Tomorrow",
    author: "James Lee",
    category: "Romance",
    status: "Published",
  },
];

const recentStories = [
  {
    title: "A Letter From the Rain",
    author: "Emma Davis",
    category: "Romance",
    status: "Pending",
  },
  {
    title: "The Hidden Door",
    author: "Daniel Smith",
    category: "Mystery",
    status: "Published",
  },
  {
    title: "Beyond the Mountain",
    author: "Sophia Brown",
    category: "Adventure",
    status: "Pending",
  },
];

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-100">

      {/* Admin Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-sm text-purple-600 font-semibold">
                READORA ADMIN
              </p>

              <h1 className="text-3xl font-bold text-gray-900 mt-1">
                Dashboard
              </h1>

              <p className="text-gray-500 mt-1">
                Manage your Readora platform.
              </p>
            </div>

            <Link
              href="/"
              className="text-purple-600 font-medium hover:underline"
            >
              ← Back to Readora
            </Link>

          </div>

        </div>
      </header>

      {/* Admin Navigation */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">

          <nav className="flex flex-wrap gap-2 py-3">

            <Link
              href="/admin"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
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

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {statistics.map((stat) => (
            <div
              key={stat.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>

                <span className="text-sm text-green-600 font-semibold">
                  {stat.change}
                </span>

              </div>

              <p className="text-gray-500 text-sm mt-5">
                {stat.title}
              </p>

              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>

            </div>
          ))}

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Link
              href="/admin/books"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <span className="text-3xl">📚</span>

              <h3 className="font-semibold text-gray-900 mt-3">
                Manage Books
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Add, edit and remove books.
              </p>
            </Link>

            <Link
              href="/admin/stories"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <span className="text-3xl">✍️</span>

              <h3 className="font-semibold text-gray-900 mt-3">
                Manage Stories
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Review community stories.
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <span className="text-3xl">👥</span>

              <h3 className="font-semibold text-gray-900 mt-3">
                Manage Users
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                View and manage users.
              </p>
            </Link>

            <Link
              href="/books"
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <span className="text-3xl">🔎</span>

              <h3 className="font-semibold text-gray-900 mt-3">
                View Website
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Open the public book section.
              </p>
            </Link>

          </div>

        </div>

        {/* Recent Books */}
        <div className="mt-10 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="p-6 border-b flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Books
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Recently added books.
              </p>
            </div>

            <Link
              href="/admin/books"
              className="text-purple-600 text-sm font-semibold hover:underline"
            >
              View All
            </Link>

          </div>

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
                    Status
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y">

                {recentBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          📖
                        </div>

                        <span className="font-medium text-gray-900">
                          {book.title}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {book.author}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {book.category}
                    </td>

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

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Recent Stories */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">

          <div className="p-6 border-b flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Community Stories
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Recently submitted stories.
              </p>
            </div>

            <Link
              href="/admin/stories"
              className="text-purple-600 text-sm font-semibold hover:underline"
            >
              View All
            </Link>

          </div>

          <div className="divide-y">

            {recentStories.map((story) => (
              <div
                key={story.title}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50"
              >

                <div>

                  <h3 className="font-semibold text-gray-900">
                    {story.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    By {story.author} • {story.category}
                  </p>

                </div>

                <span
                  className={`self-start md:self-auto px-3 py-1 rounded-full text-xs font-medium ${
                    story.status === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {story.status}
                </span>

              </div>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}