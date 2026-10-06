import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function StoriesPage({ searchParams }) {
  const params = await searchParams;

  const search = params?.search?.trim() || "";
  const categoryId = params?.category || "";

  // Get categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  // Get stories
  let query = supabase
    .from("stories")
    .select(`
      id,
      title,
      content,
      created_at,
      user_id,
      category_id
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", Number(categoryId));
  }

  const { data: stories, error } = await query;

  // Get author names
  let storiesWithAuthors = [];

  if (stories && stories.length > 0) {
    const userIds = [
      ...new Set(stories.map((story) => story.user_id)),
    ];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);

    storiesWithAuthors = stories.map((story) => {
      const profile = profiles?.find(
        (profile) => profile.id === story.user_id
      );

      const category = categories?.find(
        (category) => category.id === story.category_id
      );

      return {
        ...story,
        authorName: profile?.name || "Community Author",
        categoryName: category?.name || "General",
      };
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-purple-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <Link
            href="/"
            className="text-purple-600 hover:underline"
          >
            ← Back Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6">
            Community Stories
          </h1>

          <p className="text-gray-600 text-lg mt-3">
            Discover stories written by Readora writers.
          </p>

          {/* Search and Filter */}
          <form
            action="/stories"
            method="GET"
            className="mt-8 flex flex-col md:flex-row gap-3 max-w-4xl"
          >

            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search stories by title..."
              className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
            />

            <select
              name="category"
              defaultValue={categoryId}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-purple-500"
            >

              <option value="">
                All Categories
              </option>

              {categories?.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              🔎 Search
            </button>

            {(search || categoryId) && (
              <Link
                href="/stories"
                className="border border-gray-300 bg-white px-6 py-3 rounded-lg text-center hover:bg-gray-50"
              >
                Clear
              </Link>
            )}

          </form>

        </div>

      </section>

      {/* Stories */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {(search || categoryId) && (
          <p className="text-gray-600 mb-6">
            Showing filtered community stories
          </p>
        )}

        {error ? (

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
            Failed to load community stories.
          </div>

        ) : storiesWithAuthors.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {storiesWithAuthors.map((story) => (

              <article
                key={story.id}
                className="bg-white border rounded-2xl p-6 hover:shadow-lg transition"
              >

                <div className="flex items-center justify-between mb-4">

                  <div className="text-4xl">
                    📖
                  </div>

                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {story.categoryName}
                  </span>

                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {story.title}
                </h2>

                <p className="text-sm text-purple-600 mt-2">
                  ✍️ By {story.authorName}
                </p>

                <p className="text-gray-600 mt-4 line-clamp-4">
                  {story.content}
                </p>

                <div className="mt-6">

                  <Link
                    href={`/stories/${story.id}`}
                    className="inline-block bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700"
                  >
                    Read Story →
                  </Link>

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="bg-white border rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              🔎
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {search || categoryId
                ? "No Stories Found"
                : "No Community Stories Yet"}
            </h2>

            <p className="text-gray-600 mt-3">
              {search || categoryId
                ? "Try another search or category."
                : "Be the first writer to publish a story on Readora."}
            </p>

            {!search && !categoryId && (
              <Link
                href="/write"
                className="inline-block mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Start Writing
              </Link>
            )}

          </div>

        )}

      </section>

    </main>
  );
}