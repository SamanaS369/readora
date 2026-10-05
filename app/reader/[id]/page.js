"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Load book, reading progress and bookmark
  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load book");
        }

        setBook(data.book);
        setChapters(data.chapters);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && data.chapters.length > 0) {
          // Get saved reading progress
          const { data: progressData, error: progressError } =
            await supabase
              .from("reading_progress")
              .select("chapter_id, progress")
              .eq("user_id", user.id)
              .eq("book_id", Number(id))
              .maybeSingle();

          if (progressError) {
            console.warn(
              "Could not load reading progress:",
              progressError
            );
          }

          if (progressData) {
            const savedChapterIndex = data.chapters.findIndex(
              (chapter) => chapter.id === progressData.chapter_id
            );

            if (savedChapterIndex !== -1) {
              setCurrentChapter(savedChapterIndex);
            }
          }

          // Check whether book is already bookmarked
          const { data: libraryData, error: libraryError } =
            await supabase
              .from("library")
              .select("id")
              .eq("user_id", user.id)
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
      } catch (error) {
        console.error("Failed to fetch book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Save or remove bookmark
  const toggleBookmark = async () => {
    try {
      setBookmarkLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      if (isBookmarked) {
        // Remove from library
        const { error } = await supabase
          .from("library")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", Number(id));

        if (error) throw error;

        setIsBookmarked(false);
      } else {
        // Add to library
        const { error } = await supabase
          .from("library")
          .insert({
            user_id: user.id,
            book_id: Number(id),
          });

        if (error) throw error;

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Save reading progress
  const saveProgress = async (chapterIndex) => {
    if (!book || !chapters.length) return;

    try {
      setSavingProgress(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const progress = Math.round(
        ((chapterIndex + 1) / chapters.length) * 100
      );

      const chapter = chapters[chapterIndex];

      const { data: existingProgress, error: checkError } =
        await supabase
          .from("reading_progress")
          .select("id")
          .eq("user_id", user.id)
          .eq("book_id", book.id)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingProgress) {
        const { error } = await supabase
          .from("reading_progress")
          .update({
            chapter_id: chapter.id,
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reading_progress")
          .insert({
            user_id: user.id,
            book_id: book.id,
            chapter_id: chapter.id,
            progress,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to save reading progress:", error);
    } finally {
      setSavingProgress(false);
    }
  };

  // Change chapter and save progress
  const changeChapter = (newChapter) => {
    setCurrentChapter(newChapter);
    saveProgress(newChapter);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading book...</p>
      </main>
    );
  }

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

  const chapter = chapters[currentChapter];

  const progress = Math.round(
    ((currentChapter + 1) / chapters.length) * 100
  );

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

          <h1 className="font-semibold text-gray-900">
            {book.title}
          </h1>

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
            {isBookmarked ? "🔖" : "🔖"}
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Chapter {currentChapter + 1} of {chapters.length}
            </span>

            <span>{progress}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${progress}%` }}
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
              changeChapter(Math.max(currentChapter - 1, 0))
            }
            disabled={currentChapter === 0}
            className="px-5 py-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Previous
          </button>

          <div className="text-center">
            <span className="text-gray-500">
              {currentChapter + 1} / {chapters.length}
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
                Math.min(currentChapter + 1, chapters.length - 1)
              )
            }
            disabled={currentChapter === chapters.length - 1}
            className="px-5 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700"
          >
            Next →
          </button>
        </div>
      </article>
    </main>
  );
}