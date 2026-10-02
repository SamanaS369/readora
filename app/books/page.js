import Link from "next/link";

const books = [
  {
    id: 1,
    title: "The Silent Forest",
    author: "Maya Sharma",
    category: "Fiction",
    premium: false,
  },
  {
    id: 2,
    title: "Beyond the Stars",
    author: "Alex Carter",
    category: "Fantasy",
    premium: true,
  },
  {
    id: 3,
    title: "The Last Journey",
    author: "Sarah Wilson",
    category: "Adventure",
    premium: false,
  },
  {
    id: 4,
    title: "Dreams of Tomorrow",
    author: "James Lee",
    category: "Romance",
    premium: true,
  },
  {
    id: 5,
    title: "Whispers in the Rain",
    author: "Emma Davis",
    category: "Mystery",
    premium: false,
  },
  {
    id: 6,
    title: "The Hidden Kingdom",
    author: "Daniel Smith",
    category: "Fantasy",
    premium: true,
  },
];

export default function BooksPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Explore Books
          </h1>

          <p className="text-gray-600 mt-2">
            Discover your next favorite book.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="Search books or authors..."
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select className="bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none">
            <option>All Categories</option>
            <option>Fiction</option>
            <option>Fantasy</option>
            <option>Adventure</option>
            <option>Romance</option>
            <option>Mystery</option>
          </select>

        </div>
      </section>

      {/* Books */}
      <section className="max-w-7xl mx-auto px-6 pb-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition"
            >

              {/* Cover */}
              <div className="h-64 bg-purple-100 flex items-center justify-center relative">
                <span className="text-6xl">
                  📖
                </span>

                {book.premium && (
                  <span className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    👑 Premium
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-5">

                <h2 className="text-xl font-bold text-gray-900">
                  {book.title}
                </h2>

                <p className="text-gray-500 mt-1">
                  By {book.author}
                </p>

                <p className="text-sm text-purple-600 mt-3">
                  {book.category}
                </p>

                <Link
                  href={`/books/${book.id}`}
                  className="block text-center bg-purple-600 text-white mt-5 py-2 rounded-lg hover:bg-purple-700"
                >
                  View Book
                </Link>

              </div>

            </div>
          ))}

        </div>

      </section>

    </main>
  );
}