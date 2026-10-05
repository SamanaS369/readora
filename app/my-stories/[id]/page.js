"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditStory() {
  const params = useParams();
  const router = useRouter();

  const [story, setStory] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.id) {
      loadStory();
    }
  }, [params?.id]);

  async function loadStory() {
    try {
      setLoading(true);
      setError("");

      // Check logged-in user
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

      const storyId = Number(params.id);

      if (!Number.isInteger(storyId)) {
        setError("Invalid story ID.");
        return;
      }

      // Load categories
      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (categoryError) {
        throw categoryError;
      }

      setCategories(categoryData || []);

      // Load user's story
      const {
        data: storyData,
        error: storyError,
      } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (storyError) {
        throw storyError;
      }

      if (!storyData) {
        setError(
          "Story not found or you do not have permission to edit this story."
        );
        return;
      }

      setStory(storyData);
      setTitle(storyData.title || "");
      setContent(storyData.content || "");

      // Set selected category
      if (storyData.category_id) {
        const selectedCategory = (categoryData || []).find(
          (item) => item.id === storyData.category_id
        );

        if (selectedCategory) {
          setCategory(String(selectedCategory.id));
        }
      }
    } catch (err) {
      console.error("Load story error:", err);
      setError(err.message || "Failed to load story.");
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    setError("");

    if (!title.trim()) {
      setError("Please enter a story title.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter your story content.");
      return;
    }

    try {
      setSaving(true);

      // Check logged-in user
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

      const storyId = Number(params.id);

      // Update story
      const { data, error: updateError } = await supabase
        .from("stories")
        .update({
          title: title.trim(),
          category_id: Number(category),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", storyId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setStory(data);

      alert("Story updated successfully!");

      router.push("/my-stories");
      router.refresh();
    } catch (err) {
      console.error("Save story error:", err);
      setError(err.message || "Failed to update story.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600">Loading story...</p>
        </div>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Story Not Found</h1>

          <p className="text-red-500 mb-6">
            {error || "Unable to load this story."}
          </p>

          <button
            onClick={() => router.push("/my-stories")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to My Stories
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/my-stories")}
            className="text-purple-600 hover:text-purple-800 mb-4"
          >
            ← Back to My Stories
          </button>

          <h1 className="text-3xl font-bold">Edit Story</h1>

          <p className="text-gray-600 mt-2">
            Update your story and save your changes.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-medium mb-2">
              Story Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title"
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block font-medium mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Select a category</option>

              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block font-medium mb-2">
              Story Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story..."
              rows={20}
              className="w-full px-4 py-3 border rounded-lg outline-none resize-y focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Current Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Current status:
            </p>

            <p className="font-semibold capitalize mt-1">
              {story.status}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => router.push("/my-stories")}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}