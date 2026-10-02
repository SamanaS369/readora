import Link from "next/link";

const libraryBooks = [
  {
    id: 1,
    title: "The Silent Forest",
    author: "Maya Sharma",
    category: "Fiction",
    progress: 65,
    status: "Currently Reading",
  },
  {
    id: 3,
    title: "The Last Journey",
    author: "Sarah Wilson",
    category: "Adventure",
    progress: 100,
    status: "Completed",
  },
  {
    id: 5,
    title: "Whispers in the Rain",
    author: "Emma Davis",
    category: "Mystery",
    progress: 25,
    status: "Currently Reading",
  },
];

export default function LibraryPage() {
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {libraryBooks
              .filter((book) => book.status === "Currently Reading")
              .map((book) => (

                <div
                  key={book.id}
                  className="bg-white border rounded-xl p-5 shadow-sm"
                >

                  <div className="flex gap-5">

                    {/* Cover */}
                    <div className="w-28 h-36 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">
                        📖
                      </span>
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
                            style={{ width: `${book.progress}%` }}
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

        </div>

        {/* Saved Books */}
        <div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reading History
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {libraryBooks
              .filter((book) => book.status === "Completed")
              .map((book) => (

                <div
                  key={book.id}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm"
                >

                  <div className="h-48 bg-purple-100 flex items-center justify-center">
                    <span className="text-6xl">
                      📖
                    </span>
                  </div>

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

        </div>

      </section>

    </main>
  );
}