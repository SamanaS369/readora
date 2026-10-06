"use client";

import { useEffect, useState } from "react";
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
  const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB

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
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState("");

  // Cover image states
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);

        // Select first category automatically
        if (data && data.length > 0) {
          setCategory(String(data[0].id));
        }
      } catch (error) {
        console.error(
          "Load categories error:",
          error
        );

        setError(
          "Failed to load story categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // =========================
  // COVER IMAGE SELECTION
  // =========================

  const handleCoverChange = (event) => {
    setError("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    // Check image size
    if (file.size > MAX_COVER_SIZE) {
      setError(
        "Cover image must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setCoverFile(file);

    // Create preview
    const previewUrl =
      URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  // =========================
  // REMOVE COVER
  // =========================

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
  };

  // =========================
  // UPLOAD COVER TO SUPABASE
  // =========================

  const uploadCoverImage = async (userId) => {
    if (!coverFile) {
      return null;
    }

    try {
      setUploadingCover(true);

      // Create a safe file name
      const fileExtension =
        coverFile.name.split(".").pop() ||
        "jpg";

      const fileName =
        `${crypto.randomUUID()}.${fileExtension}`;

      // Store each user's images inside their own folder
      const filePath =
        `${userId}/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("story-covers")
        .upload(
          filePath,
          coverFile,
          {
            contentType: coverFile.type,
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from("story-covers")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "Failed to get cover image URL."
        );
      }

      return {
        url: publicUrlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error(
        "Cover upload error:",
        error
      );

      throw new Error(
        error.message ||
          "Failed to upload cover image."
      );
    } finally {
      setUploadingCover(false);
    }
  };

  // =========================
  // DELETE UPLOADED COVER
  // =========================

  const deleteUploadedCover = async (
    filePath
  ) => {
    if (!filePath) {
      return;
    }

    try {
      await supabase.storage
        .from("story-covers")
        .remove([filePath]);
    } catch (error) {
      console.error(
        "Cover cleanup error:",
        error
      );
    }
  };

  // =========================
  // SAVE DRAFT
  // =========================

  const saveDraft = async () => {
    setError("");

    if (!title.trim()) {
      setError(
        "Please enter a story title."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Please write some content before saving."
      );
      return;
    }

    if (!category) {
      setError(
        "Please select a category."
      );
      return;
    }

    try {
      setSaving(true);

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
      // UPLOAD COVER
      // -------------------------

      let uploadedCover = null;

      if (coverFile) {
        uploadedCover =
          await uploadCoverImage(user.id);
      }

      // -------------------------
      // SAVE STORY
      // -------------------------

      const { error: insertError } =
        await supabase
          .from("stories")
          .insert({
            user_id: user.id,
            title: title.trim(),
            category_id: Number(category),
            cover_url:
              uploadedCover?.url || null,
            content: content.trim(),
            status: "draft",
          });

      if (insertError) {
        // Delete uploaded image if DB insert fails
        if (uploadedCover?.path) {
          await deleteUploadedCover(
            uploadedCover.path
          );
        }

        throw insertError;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Save draft error:",
        error
      );

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
      setError(
        "Please enter a story title."
      );
      return;
    }

    // -------------------------
    // CATEGORY CHECK
    // -------------------------

    if (!category) {
      setError(
        "Please select a category."
      );
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

    const wordCount =
      getWordCount(content);

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

      const selectedCategory =
        categories.find(
          (item) =>
            String(item.id) ===
            String(category)
        );

      const categoryName =
        selectedCategory?.name ||
        "General";

      // =========================
      // AI MODERATION
      // =========================

      const moderationResponse =
        await fetch(
          "/api/moderate-story",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title: title.trim(),
              content: content.trim(),
              category: categoryName,
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

      if (
        decision === "approved" ||
        decision === "needs_review"
      ) {
        // -------------------------
        // UPLOAD COVER
        // -------------------------

        let uploadedCover = null;

        if (coverFile) {
          uploadedCover =
            await uploadCoverImage(
              user.id
            );
        }

        // -------------------------
        // INSERT PUBLISHED STORY
        // -------------------------

        const {
          error: insertError,
        } = await supabase
          .from("stories")
          .insert({
            user_id: user.id,

            title: title.trim(),

            category_id:
              Number(category),

            cover_url:
              uploadedCover?.url ||
              null,

            content: content.trim(),

            status: "published",

            moderation_status:
              "approved",

            moderation_reason:
              reason,

            moderation_score:
              score,

            reviewed_at:
              new Date().toISOString(),
          });

        if (insertError) {
          // Clean up image if database insert fails
          if (uploadedCover?.path) {
            await deleteUploadedCover(
              uploadedCover.path
            );
          }

          throw insertError;
        }

        alert(
          "Your story has been approved by AI and published!"
        );

        router.push(
          "/my-stories"
        );

        return;
      }

      // =========================
      // AI REJECTED
      // =========================

      if (decision === "rejected") {
        // -------------------------
        // UPLOAD COVER
        // -------------------------

        let uploadedCover = null;

        if (coverFile) {
          uploadedCover =
            await uploadCoverImage(
              user.id
            );
        }

        // -------------------------
        // SAVE REJECTED STORY
        // -------------------------

        const {
          data: story,
          error: insertError,
        } = await supabase
          .from("stories")
          .insert({
            user_id: user.id,

            title: title.trim(),

            category_id:
              Number(category),

            cover_url:
              uploadedCover?.url ||
              null,

            content: content.trim(),

            status: "rejected",

            moderation_status:
              "rejected",

            moderation_reason:
              reason,

            moderation_score:
              score,

            reviewed_at:
              new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) {
          if (uploadedCover?.path) {
            await deleteUploadedCover(
              uploadedCover.path
            );
          }

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

            title:
              "Story Not Approved",

            message:
              `Your story was not approved by AI. Reason: ${reason}`,

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

        router.push(
          "/my-stories"
        );

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

  const wordCount =
    getWordCount(content);

  // =========================
  // RENDER
  // =========================

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
                    setTitle(
                      e.target.value
                    )
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
                    setCategory(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingCategories
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                >

                  {loadingCategories ? (
                    <option value="">
                      Loading categories...
                    </option>
                  ) : categories.length ===
                    0 ? (
                    <option value="">
                      No categories available
                    </option>
                  ) : (
                    categories.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      )
                    )
                  )}

                </select>

              </div>

            </div>

            {/* =========================
                COVER IMAGE
            ========================= */}

            <div className="mt-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Cover
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">

                {!coverPreview ? (
                  <div className="text-center">

                    <div className="text-4xl mb-3">
                      🖼️
                    </div>

                    <p className="text-gray-700 font-medium">
                      Upload a cover image
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG, WEBP or other image
                      formats up to 5 MB
                    </p>

                    <label className="inline-block mt-4 cursor-pointer bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700">

                      Choose Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleCoverChange
                        }
                        className="hidden"
                      />

                    </label>

                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* PREVIEW */}

                    <div className="w-40">

                      <img
                        src={coverPreview}
                        alt="Story cover preview"
                        className="w-40 h-56 object-cover rounded-lg border shadow-sm"
                      />

                    </div>

                    {/* DETAILS */}

                    <div className="flex-1">

                      <p className="font-medium text-gray-900">
                        {coverFile?.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {coverFile
                          ? `${(
                              coverFile.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ""}
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4">

                        <label className="cursor-pointer border border-purple-600 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50">

                          Change Image

                          <input
                            type="file"
                            accept="image/*"
                            onChange={
                              handleCoverChange
                            }
                            className="hidden"
                          />

                        </label>

                        <button
                          type="button"
                          onClick={
                            removeCover
                          }
                          className="border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50"
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              </div>

              <p className="text-sm text-gray-500 mt-2">
                A good cover image helps readers
                recognize your story.
              </p>

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
                {wordCount} /{" "}
                {MIN_WORDS} words
              </span>

            </div>

            {/* TEXTAREA */}

            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
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

            {/* AI ASSISTANT */}

            <AIAssistant
              content={content}
              onAccept={
                acceptAISuggestion
              }
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
                disabled={
                  saving ||
                  loadingCategories ||
                  uploadingCover
                }
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
                    .querySelector(
                      "textarea"
                    )
                    ?.focus();
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
              >
                🤖 AI Assistant
              </button>

              {/* PREVIEW */}

              <button
                type="button"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                👁️ Preview
              </button>

              {/* PUBLISH */}

              <button
                onClick={
                  publishStory
                }
                disabled={
                  publishing ||
                  loadingCategories ||
                  uploadingCover
                }
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {publishing
                  ? "Checking Story..."
                  : "🚀 Publish Story"}
              </button>

            </div>

            {/* UPLOAD MESSAGE */}

            {uploadingCover && (
              <p className="text-purple-600 mt-4">
                ⏳ Uploading cover image...
              </p>
            )}

            {/* SUCCESS MESSAGE */}

            {saved && (
              <p className="text-green-600 mt-4">
                ✓ Draft saved successfully!
              </p>
            )}

            {/* ERROR MESSAGE */}

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