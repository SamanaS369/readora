import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, content, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
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
              className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50"
            >
              Start Writing
            </Link>

          </div>

        </div>
      </section>

      {/* Community Stories */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Community Stories
            </h2>

            <p className="text-gray-600 mt-2">
              Discover stories written by Readora writers.
            </p>
          </div>

          <Link
            href="/write"
            className="text-purple-600 font-medium hover:underline"
          >
            Write a Story →
          </Link>

        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
            Failed to load community stories.
          </div>
        ) : stories && stories.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {stories.map((story) => (

              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="bg-white border rounded-2xl p-6 hover:shadow-lg hover:border-purple-300 transition"
              >

                <div className="text-3xl mb-4">
                  📖
                </div>

                <h3 className="text-xl font-bold text-gray-900">
                  {story.title}
                </h3>

                <p className="text-gray-600 mt-3 line-clamp-3">
                  {story.content}
                </p>

                <div className="mt-5 text-purple-600 font-medium">
                  Read Story →
                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="bg-white border rounded-2xl p-10 text-center">

            <div className="text-4xl mb-4">
              ✍️
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              No community stories yet
            </h3>

            <p className="text-gray-600 mt-2">
              Be the first person to publish a story on Readora.
            </p>

            <Link
              href="/write"
              className="inline-block mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Start Writing
            </Link>

          </div>

        )}

      </section>

    </main>
  );
}