"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddToLibraryButton({
  bookId = null,
  storyId = null,
}) {
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkLibrary();
  }, [bookId, storyId]);

  async function checkLibrary() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setSaved(false);
        return;
      }

      let query = supabase
        .from("library")
        .select("id")
        .eq("user_id", user.id);

      if (bookId !== null) {
        query = query.eq(
          "book_id",
          Number(bookId)
        );
      }

      if (storyId !== null) {
        query = query.eq(
          "story_id",
          Number(storyId)
        );
      }

      const { data, error } =
        await query.maybeSingle();

      if (error) {
        console.error(
          "Library check error:",
          error
        );

        setSaved(false);
        return;
      }

      setSaved(!!data);
    } catch (error) {
      console.error(
        "Library check failed:",
        error
      );

      setSaved(false);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLibrary() {
    if (!user) {
      alert(
        "Please login to add items to your library."
      );
      return;
    }

    if (
      bookId === null &&
      storyId === null
    ) {
      console.error(
        "No bookId or storyId provided."
      );
      return;
    }

    try {
      setSaving(true);

      /*
        Remove from library
      */
      if (saved) {
        let deleteQuery = supabase
          .from("library")
          .delete()
          .eq("user_id", user.id);

        if (bookId !== null) {
          deleteQuery = deleteQuery.eq(
            "book_id",
            Number(bookId)
          );
        }

        if (storyId !== null) {
          deleteQuery = deleteQuery.eq(
            "story_id",
            Number(storyId)
          );
        }

        const { error } =
          await deleteQuery;

        if (error) {
          throw error;
        }

        setSaved(false);
        return;
      }

      /*
        Add to library
      */

      const libraryData = {
        user_id: user.id,
        book_id:
          bookId !== null
            ? Number(bookId)
            : null,
        story_id:
          storyId !== null
            ? Number(storyId)
            : null,
      };

      const { error } =
        await supabase
          .from("library")
          .insert(libraryData);

      if (error) {
        throw error;
      }

      setSaved(true);
    } catch (error) {
      console.error(
        "Library update error:",
        error
      );

      alert(
        "Unable to update your library."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="bg-gray-200 text-gray-500 px-6 py-3 rounded-lg"
      >
        Checking Library...
      </button>
    );
  }

  return (
    <button
      onClick={toggleLibrary}
      disabled={saving}
      className={`px-6 py-3 rounded-lg font-medium transition ${
        saved
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }`}
    >
      {saving
        ? "Saving..."
        : saved
        ? "✓ Saved to Library"
        : "📚 Add to Library"}
    </button>
  );
}