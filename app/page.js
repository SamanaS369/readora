import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      <section className="bg-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Next Story
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Read books. Discover stories.
            <br />
            Write and share your imagination.
          </p>

          <div className="flex justify-center gap-4">

            <Link
              href="/books"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Explore Books
            </Link>

            <Link
              href="/write"
              className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg"
            >
              Start Writing
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}