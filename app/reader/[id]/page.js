"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const FREE_BOOK_LIMIT = 5;

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  const [savingProgress, setSavingProgress] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // =====================================================
  // CHECK READING ACCESS
  // =====================================================

  useEffect(() => {
    if (!id) return;

    fetchBookAndCheckAccess();
  }, [id]);

  async function fetchBookAndCheckAccess() {
    try {
      setLoading(true);

      // -------------------------------------------------
      // Get book
      // -------------------------------------------------

      const response = await fetch(`/api/books/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load book"
        );
      }

      const loadedBook = data.book;

      setBook(loadedBook);

      // -------------------------------------------------
      // Get current user
      // -------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Login required
      if (!user) {
        setAccessDenied(true);
        setAccessMessage(
          "Please login to read books on Readora."
        );
        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // Get user's plan
      // -------------------------------------------------

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        );
      }

      const isPremiumUser =
        profile?.plan === "premium";

      // -------------------------------------------------
      // PREMIUM USER
      // -------------------------------------------------

      if (isPremiumUser) {
        setChapters(data.chapters || []);

        await loadUserProgressAndLibrary(
          user.id,
          loadedBook,
          data.chapters || []
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // FREE USER + PREMIUM BOOK
      // -------------------------------------------------

      if (loadedBook.isPremium) {
        setAccessDenied(true);
        setAccessMessage(
          "This is a Premium book. Upgrade to Premium to read it."
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // FREE USER
      //
      // Count UNIQUE books from reading_progress.
      // Library is NOT used for the reading limit.
      // -------------------------------------------------

      const {
        data: progressBooks,
        error: progressError,
      } = await supabase
        .from("reading_progress")
        .select("book_id")
        .eq("user_id", user.id);

      if (progressError) {
        console.error(
          "Reading progress error:",
          progressError
        );

        setAccessDenied(true);
        setAccessMessage(
          "Unable to check your reading access. Please try again."
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // Get unique books
      // -------------------------------------------------

      const uniqueBookIds = new Set(
        (progressBooks || []).map(
          (item) => Number(item.book_id)
        )
      );

      const booksRead = uniqueBookIds.size;

      const currentBookId = Number(id);

      const alreadyStarted =
        uniqueBookIds.has(currentBookId);

      // -------------------------------------------------
      // IMPORTANT:
      // If the user already started this book,
      // they can continue even if they reached 5.
      // -------------------------------------------------

      if (
        !alreadyStarted &&
        booksRead >= FREE_BOOK_LIMIT
      ) {
        setAccessDenied(true);

        setAccessMessage(
          "You have reached the 5-book free reading limit. Upgrade to Premium for unlimited reading."
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // ACCESS GRANTED
      // -------------------------------------------------

      setChapters(data.chapters || []);

      await loadUserProgressAndLibrary(
        user.id,
        loadedBook,
        data.chapters || []
      );

      // -------------------------------------------------
      // Mark this book as started
      //
      // This is what makes the book count toward
      // the free user's 5-book limit.
      // -------------------------------------------------

      if (!alreadyStarted) {
        const firstChapter =
          data.chapters?.[0];

        const { error: insertProgressError } =
          await supabase
            .from("reading_progress")
            .insert({
              user_id: user.id,
              book_id: currentBookId,
              chapter_id:
                firstChapter?.id || null,
              progress: 0,
            });

        if (insertProgressError) {
          console.error(
            "Could not mark book as started:",
            insertProgressError
          );
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(
        "Failed to fetch book:",
        error
      );

      setLoading(false);
    }
  }

  // =====================================================
  // LOAD PROGRESS + LIBRARY
  // =====================================================

  async function loadUserProgressAndLibrary(
    userId,
    loadedBook,
    loadedChapters
  ) {
    if (!loadedChapters.length) {
      return;
    }

    // -------------------------------------------------
    // Reading progress
    // -------------------------------------------------

    const {
      data: progressData,
      error: progressError,
    } = await supabase
      .from("reading_progress")
      .select("chapter_id, progress")
      .eq("user_id", userId)
      .eq("book_id", Number(id))
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (progressError) {
      console.warn(
        "Could not load reading progress:",
        progressError
      );
    }

    if (progressData) {
      const savedChapterIndex =
        loadedChapters.findIndex(
          (chapter) =>
            chapter.id ===
            progressData.chapter_id
        );

      if (savedChapterIndex !== -1) {
        setCurrentChapter(
          savedChapterIndex
        );
      }
    }

    // -------------------------------------------------
    // Check library/bookmark
    // -------------------------------------------------

    const {
      data: libraryData,
      error: libraryError,
    } = await supabase
      .from("library")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", Number(id))
      .maybeSingle();

    if (libraryError) {
      console.warn(
        "Could not check library:",
        libraryError
      );
    }

    setIsBookmarked(!!libraryData);
  }

  // =====================================================
  // TOGGLE BOOKMARK
  // =====================================================

  async function toggleBookmark() {
    try {
      setBookmarkLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // -------------------------------------------------
      // REMOVE BOOKMARK
      // -------------------------------------------------

      if (isBookmarked) {
        const { error } = await supabase
          .from("library")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", Number(id));

        if (error) {
          throw error;
        }

        setIsBookmarked(false);

        return;
      }

      // -------------------------------------------------
      // ADD BOOKMARK
      //
      // Library is separate from reading progress.
      // We therefore don't use library count as the
      // reading limit anymore.
      // -------------------------------------------------

      const { error } = await supabase
        .from("library")
        .insert({
          user_id: user.id,
          book_id: Number(id),
        });

      if (error) {
        // Handle duplicate bookmark gracefully
        if (
          error.code === "23505" ||
          error.message
            ?.toLowerCase()
            .includes("duplicate")
        ) {
          setIsBookmarked(true);
        } else {
          throw error;
        }
      } else {
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error(
        "Bookmark error:",
        error
      );
    } finally {
      setBookmarkLoading(false);
    }
  }

  // =====================================================
  // SAVE READING PROGRESS
  // =====================================================

  async function saveProgress(chapterIndex) {
    if (!book || !chapters.length) {
      return;
    }

    try {
      setSavingProgress(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const progress = Math.round(
        ((chapterIndex + 1) /
          chapters.length) *
          100
      );

      const chapter =
        chapters[chapterIndex];

      // -------------------------------------------------
      // Check existing progress
      // -------------------------------------------------

      const {
        data: existingProgress,
        error: checkError,
      } = await supabase
        .from("reading_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", book.id)
        .order("updated_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      if (existingProgress) {
        const { error } = await supabase
          .from("reading_progress")
          .update({
            chapter_id: chapter.id,
            progress,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingProgress.id
          );

        if (error) {
          throw error;
        }
      }

      // -------------------------------------------------
      // INSERT
      // -------------------------------------------------

      else {
        const { error } =
          await supabase
            .from("reading_progress")
            .insert({
              user_id: user.id,
              book_id: book.id,
              chapter_id: chapter.id,
              progress,
            });

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        "Failed to save reading progress:",
        error
      );
    } finally {
      setSavingProgress(false);
    }
  }

  // =====================================================
  // CHANGE CHAPTER
  // =====================================================

  function changeChapter(newChapter) {
    setCurrentChapter(newChapter);
    saveProgress(newChapter);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Checking reading access...
        </p>
      </main>
    );
  }

  // =====================================================
  // BOOK NOT FOUND
  // =====================================================

  if (!book) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Book Not Found
          </h1>

          <Link
            href="/books"
            className="inline-block mt-5 bg-purple-600 text-white px-5 py-2 rounded-lg"
          >
            Back to Books
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // ACCESS DENIED
  // =====================================================

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8 text-center">

          {book.isPremium ? (
            <div className="text-5xl mb-4">
              👑
            </div>
          ) : (
            <div className="text-5xl mb-4">
              🔒
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900">
            {book.isPremium
              ? "Premium Book"
              : "Free Reading Limit Reached"}
          </h1>

          <p className="text-gray-600 mt-4 leading-7">
            {accessMessage}
          </p>

          <div className="flex flex-col gap-3 mt-7">

            <Link
              href="/premium"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              👑 Upgrade to Premium
            </Link>

            <Link
              href={`/books/${book.id}`}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              ← Back to Book
            </Link>

            <Link
              href="/books"
              className="text-purple-600 hover:underline"
            >
              Explore Other Books
            </Link>

          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // NO CHAPTERS
  // =====================================================

  if (chapters.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {book.title}
          </h1>

          <p className="text-gray-500 mt-3">
            No chapters available yet.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // CURRENT CHAPTER
  // =====================================================

  const chapter =
    chapters[currentChapter];

  const progress = Math.round(
    ((currentChapter + 1) /
      chapters.length) *
      100
  );

  // =====================================================
  // READER UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            href={`/books/${book.id}`}
            className="text-purple-600 hover:underline"
          >
            ← Back
          </Link>

          <div className="flex items-center gap-2">

            {book.isPremium && (
              <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                👑 Premium
              </span>
            )}

            <h1 className="font-semibold text-gray-900">
              {book.title}
            </h1>

          </div>

          <button
            onClick={toggleBookmark}
            disabled={bookmarkLoading}
            className="text-xl disabled:opacity-50"
            title={
              isBookmarked
                ? "Remove from Library"
                : "Add to Library"
            }
          >
            {isBookmarked
              ? "🔖"
              : "🔖"}
          </button>

        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-3">

          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Chapter {currentChapter + 1} of{" "}
              {chapters.length}
            </span>

            <span>
              {progress}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>
      </div>

      {/* Chapter Content */}
      <article className="max-w-3xl mx-auto px-6 py-12">

        <p className="text-purple-600 font-medium mb-3">
          Chapter {chapter.chapterNumber}
        </p>

        <h2 className="text-4xl font-bold text-gray-900 mb-8">
          {chapter.title}
        </h2>

        <div className="text-lg leading-8 text-gray-700 whitespace-pre-line">
          {chapter.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">

          <button
            onClick={() =>
              changeChapter(
                Math.max(
                  currentChapter - 1,
                  0
                )
              )
            }
            disabled={
              currentChapter === 0
            }
            className="px-5 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Previous
          </button>

          <div className="text-center">

            <span className="text-gray-500">
              {currentChapter + 1} /{" "}
              {chapters.length}
            </span>

            {savingProgress && (
              <p className="text-xs text-purple-600 mt-1">
                Saving...
              </p>
            )}

          </div>

          <button
            onClick={() =>
              changeChapter(
                Math.min(
                  currentChapter + 1,
                  chapters.length - 1
                )
              )
            }
            disabled={
              currentChapter ===
              chapters.length - 1
            }
            className="px-5 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700"
          >
            Next →
          </button>

        </div>

      </article>
    </main>
  );
}