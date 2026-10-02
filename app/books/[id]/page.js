import Link from "next/link";

const books = [
  {
    id: 1,
    title: "The Silent Forest",
    author: "Maya Sharma",
    category: "Fiction",
    premium: false,
    description:
      "A mysterious journey into a silent forest where every shadow seems to hide a secret.",
  },
  {
    id: 2,
    title: "Beyond the Stars",
    author: "Alex Carter",
    category: "Fantasy",
    premium: true,
    description:
      "An exciting fantasy adventure that takes you beyond the stars and into an unknown world.",
  },
  {
    id: 3,
    title: "The Last Journey",
    author: "Sarah Wilson",
    category: "Adventure",
    premium: false,
    description:
      "A thrilling adventure about courage, friendship, and one unforgettable journey.",
  },
  {
    id: 4,
    title: "Dreams of Tomorrow",
    author: "James Lee",
    category: "Romance",
    premium: true,
    description:
      "A heartfelt story about dreams, relationships, and finding hope for tomorrow.",
  },
  {
    id: 5,
    title: "Whispers in the Rain",
    author: "Emma Davis",
    category: "Mystery",
    premium: false,
    description:
      "A mysterious story filled with secrets, unexpected discoveries, and whispers in the rain.",
  },
  {
    id: 6,
    title: "The Hidden Kingdom",
    author: "Daniel Smith",
    category: "Fantasy",
    premium: true,
    description:
      "Discover a hidden kingdom filled with magic, adventure, and ancient secrets.",
  },
];

export default async function BookDetails({ params }) {
  const { id } = await params;

  const book = books.find((book) => book.id === Number(id));

  if (!book) {
    return (
      <main className="min-h-screen flex items-center justify-center">
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
    <main className="min-h-screen bg-gray-50">

      {/* Book Details */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Cover */}
          <div className="h-[500px] bg-purple-100 rounded-2xl flex items-center justify-center shadow-sm">
            <span className="text-9xl">
              📖
            </span>
          </div>

          {/* Information */}
          <div>

            {book.premium && (
              <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                👑 Premium
              </span>
            )}

            <h1 className="text-4xl font-bold text-gray-900">
              {book.title}
            </h1>

            <p className="text-lg text-gray-500 mt-3">
              By {book.author}
            </p>

            <p className="text-purple-600 font-medium mt-4">
              {book.category}
            </p>

            <p className="text-gray-600 leading-7 mt-8">
              {book.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">

              <Link
                href={`/reader/${book.id}`}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                📖 Read Now
              </Link>

              <button className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50">
                🔖 Add to Library
              </button>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}