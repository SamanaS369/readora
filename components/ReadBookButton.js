"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FREE_BOOK_LIMIT = 5;

export default function ReadBookButton({ bookId, isPremium }) {
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    checkAccess();
  }, [bookId, isPremium]);

  async function checkAccess() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Not logged in
      if (!user) {
        if (isPremium) {
          setCanRead(false);
          setReason("login-premium");
        } else {
          setCanRead(true);
        }

        setLoading(false);
        return;
      }

      // Get user's plan
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
      }

      const isPremiumUser = profile?.plan === "premium";

      // Premium users can read everything
      if (isPremiumUser) {
        setCanRead(true);
        setLoading(false);
        return;
      }

      // Free user cannot read premium books
      if (isPremium) {
        setCanRead(false);
        setReason("premium-book");
        setLoading(false);
        return;
      }

      // Count books in My Library
      const { count, error: libraryError } = await supabase
        .from("library")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      if (libraryError) {
        console.error(libraryError);
      }

      const booksRead = count || 0;

      if (booksRead >= FREE_BOOK_LIMIT) {
        setCanRead(false);
        setReason("limit");
      } else {
        setCanRead(true);
      }
    } catch (error) {
      console.error("Premium access error:", error);
      setCanRead(false);
      setReason("error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg"
      >
        Checking access...
      </button>
    );
  }

  if (canRead) {
    return (
      <Link
        href={`/reader/${bookId}`}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
      >
        📖 Read Now
      </Link>
    );
  }

  if (reason === "premium-book") {
    return (
      <div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="font-semibold text-yellow-800">
            👑 Premium Book
          </p>

          <p className="text-sm text-yellow-700 mt-1">
            This book is available only to Premium members.
          </p>
        </div>

        <Link
          href="/premium"
          className="inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
        >
          👑 Upgrade to Premium
        </Link>
      </div>
    );
  }

  if (reason === "login-premium") {
    return (
      <div>
        <p className="text-gray-600 mb-3">
          Login and become a Premium member to read this book.
        </p>

        <Link
          href="/login"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (reason === "limit") {
    return (
      <div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="font-semibold text-purple-800">
            📚 Free reading limit reached
          </p>

          <p className="text-sm text-purple-700 mt-1">
            Free members can read up to 5 books.
            Upgrade to Premium for unlimited reading.
          </p>
        </div>

        <Link
          href="/premium"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          👑 Upgrade to Premium
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-red-600 mb-3">
        Unable to check your reading access.
      </p>

      <button
        onClick={checkAccess}
        className="bg-gray-800 text-white px-6 py-3 rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}