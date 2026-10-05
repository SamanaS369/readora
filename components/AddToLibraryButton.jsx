"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddToLibraryButton({ bookId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToLibrary = async () => {
    setLoading(true);
    setMessage("");

    try {
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

      // Check if book is already in library
      const { data: existingBook, error: checkError } = await supabase
        .from("library")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingBook) {
        setMessage("This book is already in your library.");
        return;
      }

      // Add book to library
      const { error: insertError } = await supabase
        .from("library")
        .insert({
          user_id: user.id,
          book_id: bookId,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("Book added to your library!");
    } catch (error) {
      console.error("Add to library error:", error);
      setMessage(error.message || "Failed to add book to library.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToLibrary}
        disabled={loading}
        className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Library"}
      </button>

      {message && (
        <p className="text-sm text-gray-600 mt-3">
          {message}
        </p>
      )}
    </div>
  );
}