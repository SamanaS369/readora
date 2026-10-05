"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MyStoriesPage() {
  const router = useRouter();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (storiesError) {
        throw storiesError;
      }

      setStories(data || []);
    } catch (err) {
      console.error("Load stories error:", err);
      setError(err.message || "Failed to load your stories.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteStory(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this story?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from("stories")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setStories((currentStories) =>
        currentStories.filter((story) => story.id !== id)
      );
    } catch (err) {
      console.error("Delete story error:", err);
      alert(err.message || "Failed to delete story.");
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your stories...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Stories</h1>

            <p className="text-gray-600 mt-2">
              Manage the stories you have written.
            </p>
          </div>

          <Link
            href="/write"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
          >
            + Write New Story
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {stories.length === 0 && !error && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3">
              You have no stories yet
            </h2>

            <p className="text-gray-600 mb-6">
              Start writing your first story and share it with readers.
            </p>

            <Link
              href="/write"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Start Writing
            </Link>
          </div>
        )}

        {/* Stories */}
        {stories.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className="border rounded-xl p-6 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {story.title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Created{" "}
                      {story.created_at
                        ? new Date(story.created_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                      story.status
                    )}`}
                  >
                    {story.status || "draft"}
                  </span>
                </div>

                <p className="text-gray-600 mt-4 line-clamp-3">
                  {story.content || "No content yet."}
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  {/* EDIT */}
                  <Link
                    href={`/my-stories/${story.id}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Edit
                  </Link>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteStory(story.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}