"use client";

import { useState } from "react";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const router = useRouter();

  // =========================
  // STORY REQUIREMENTS
  // =========================

  const MIN_WORDS = 900;

  const getWordCount = (text) => {
    return text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  };

  // =========================
  // STATES
  // =========================

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [content, setContent] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GET CATEGORY ID
  // =========================

  const getCategoryId = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.id || null;
  };

  // =========================
  // SAVE DRAFT
  // =========================

  const saveDraft = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a story title.");
      return;
    }

    if (!content.trim()) {
      setError("Please write some content before saving.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const categoryId = await getCategoryId();

      const { error: insertError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          title: title.trim(),
          category_id: categoryId,
          content: content.trim(),
          status: "draft",
        });

      if (insertError) {
        throw insertError;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Save draft error:", error);

      setError(
        error.message ||
          "Failed to save draft."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // PUBLISH STORY
  // =========================

  const publishStory = async () => {
    setError("");

    // -------------------------
    // TITLE CHECK
    // -------------------------

    if (!title.trim()) {
      setError("Please enter a story title.");
      return;
    }

    // -------------------------
    // CONTENT CHECK
    // -------------------------

    if (!content.trim()) {
      setError(
        "Please write some content before publishing."
      );
      return;
    }

    // -------------------------
    // WORD COUNT CHECK
    // -------------------------

    const wordCount = getWordCount(content);

    if (wordCount < MIN_WORDS) {
      setError(
        `Your story must be at least 3 pages long. Please write at least ${MIN_WORDS} words. Current word count: ${wordCount}.`
      );
      return;
    }

    try {
      setPublishing(true);

      // -------------------------
      // CHECK LOGIN
      // -------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // -------------------------
      // GET CATEGORY
      // -------------------------

      const categoryId = await getCategoryId();

      // =========================
      // STEP 1
      // AI MODERATION
      // =========================

      const moderationResponse = await fetch(
        "/api/moderate-story",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        }
      );

      const moderationResult =
        await moderationResponse.json();

      // -------------------------
      // MODERATION ERROR
      // -------------------------

      if (!moderationResponse.ok) {
        throw new Error(
          moderationResult.error ||
            "Story moderation failed."
        );
      }

      const {
        decision,
        reason,
        score,
      } = moderationResult;

      // =========================
      // AI APPROVED
      // =========================

      /*
       * No admin approval is required.
       *
       * approved
       *     ↓
       * publish immediately
       *
       * needs_review
       *     ↓
       * also publish immediately
       */

      if (
        decision === "approved" ||
        decision === "needs_review"
      ) {
        const { error: insertError } =
          await supabase
            .from("stories")
            .insert({
              user_id: user.id,

              title: title.trim(),

              category_id: categoryId,

              content: content.trim(),

              status: "published",

              moderation_status: "approved",

              moderation_reason: reason,

              moderation_score: score,

              reviewed_at:
                new Date().toISOString(),
            });

        if (insertError) {
          throw insertError;
        }

        alert(
          "Your story has been approved by AI and published!"
        );

        router.push("/my-stories");

        return;
      }

      // =========================
      // AI REJECTED
      // =========================

      if (decision === "rejected") {
        const {
          data: story,
          error: insertError,
        } = await supabase
          .from("stories")
          .insert({
            user_id: user.id,

            title: title.trim(),

            category_id: categoryId,

            content: content.trim(),

            status: "rejected",

            moderation_status: "rejected",

            moderation_reason: reason,

            moderation_score: score,

            reviewed_at:
              new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        // =========================
        // CREATE NOTIFICATION
        // =========================

        const {
          error: notificationError,
        } = await supabase
          .from("notifications")
          .insert({
            user_id: user.id,

            story_id: story.id,

            title: "Story Not Approved",

            message: `Your story was not approved by AI. Reason: ${reason}`,

            type: "moderation",
          });

        if (notificationError) {
          console.error(
            "Notification error:",
            notificationError
          );
        }

        alert(
          "Your story could not be published. Please check your notifications for more information."
        );

        router.push("/my-stories");

        return;
      }

      // =========================
      // UNKNOWN AI RESPONSE
      // =========================

      throw new Error(
        "Unknown moderation result."
      );
    } catch (error) {
      console.error(
        "Publish story error:",
        error
      );

      setError(
        error.message ||
          "Failed to publish story."
      );
    } finally {
      setPublishing(false);
    }
  };

  // =========================
  // AI SUGGESTION
  // =========================

  const acceptAISuggestion = (
    suggestion
  ) => {
    setContent(suggestion);
  };

  // =========================
  // CURRENT WORD COUNT
  // =========================

  const wordCount = getWordCount(content);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =========================
          HEADER
      ========================= */}

      <section className="bg-purple-50 py-10">
        <div className="max-w-6xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-4xl font-bold text-gray-900">
                Write Your Story
              </h1>

              <p className="text-gray-600 mt-2">
                Turn your imagination into a story.
              </p>

            </div>

            <Link
              href="/"
              className="text-purple-600 hover:underline"
            >
              ← Back Home
            </Link>

          </div>

        </div>
      </section>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        <div className="bg-white border rounded-2xl shadow-sm">

          {/* =========================
              STORY INFORMATION
          ========================= */}

          <div className="p-6 border-b">

            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Story Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              {/* TITLE */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter your story title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                >

                  <option>Fiction</option>

                  <option>Fantasy</option>

                  <option>Romance</option>

                  <option>Mystery</option>

                  <option>Adventure</option>

                  <option>Horror</option>

                  <option>Science Fiction</option>

                  <option>Other</option>

                </select>

              </div>

            </div>

          </div>

          {/* =========================
              STORY CONTENT
          ========================= */}

          <div className="p-6">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-xl font-bold text-gray-900">
                Story Content
              </h2>

              <span
                className={`text-sm font-medium ${
                  wordCount >= MIN_WORDS
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {wordCount} / {MIN_WORDS} words
              </span>

            </div>

            {/* TEXTAREA */}

            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Start writing your story here..."
              className="w-full min-h-[500px] border border-gray-300 rounded-xl p-5 text-lg leading-8 resize-y outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* WORD REQUIREMENT */}

            <p
              className={`text-sm mt-2 ${
                wordCount >= MIN_WORDS
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {wordCount >= MIN_WORDS
                ? "✓ Your story meets the minimum length requirement."
                : `Minimum ${MIN_WORDS} words required to publish (approximately 3 pages).`}
            </p>

            {/* =========================
                AI ASSISTANT
            ========================= */}

            <AIAssistant
              content={content}
              onAccept={acceptAISuggestion}
            />

          </div>

          {/* =========================
              ACTION BUTTONS
          ========================= */}

          <div className="border-t p-6">

            <div className="flex flex-wrap gap-4">

              {/* SAVE DRAFT */}

              <button
                onClick={saveDraft}
                disabled={saving}
                className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Draft"}
              </button>

              {/* AI BUTTON */}

              <button
                onClick={() => {
                  document
                    .querySelector("textarea")
                    ?.focus();
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
              >
                🤖 AI Assistant
              </button>

              {/* PREVIEW */}

              <button
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                👁️ Preview
              </button>

              {/* PUBLISH */}

              <button
                onClick={publishStory}
                disabled={publishing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {publishing
                  ? "Checking Story..."
                  : "🚀 Publish Story"}
              </button>

            </div>

            {/* =========================
                SUCCESS MESSAGE
            ========================= */}

            {saved && (
              <p className="text-green-600 mt-4">
                ✓ Draft saved successfully!
              </p>
            )}

            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (
              <p className="text-red-600 mt-4">
                {error}
              </p>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}