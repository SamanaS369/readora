"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FREE_READING_LIMIT = 5;

export default function StoryReaderPage() {
  const params = useParams();

  const storyId = Number(params.id);

  const [story, setStory] = useState(null);
  const [author, setAuthor] = useState(null);
  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [accessChecking, setAccessChecking] = useState(true);

  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const [canRead, setCanRead] = useState(false);
  const [message, setMessage] = useState("");

  // Library
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [librarySaving, setLibrarySaving] = useState(false);

  // Reading
  const [readingStarted, setReadingStarted] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(storyId)) {
      setLoading(false);
      setAccessChecking(false);
      setLibraryLoading(false);
      return;
    }

    loadStory();
  }, [storyId]);

  // --------------------------------------------------
  // LOAD STORY
  // --------------------------------------------------

  async function loadStory() {
    try {
      setLoading(true);

      const {
        data: storyData,
        error: storyError,
      } = await supabase
        .from("stories")
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          category_id,
          cover_url,
          status
        `)
        .eq("id", storyId)
        .eq("status", "published")
        .single();

      if (storyError) {
        console.error("Story error:", storyError);
        setStory(null);
        return;
      }

      setStory(storyData);

      // ----------------------------------------------
      // AUTHOR
      // ----------------------------------------------

      if (storyData.user_id) {
        const {
          data: authorData,
          error: authorError,
        } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", storyData.user_id)
          .single();

        if (authorError) {
          console.error(
            "Author error:",
            authorError
          );
        } else {
          setAuthor(authorData);
        }
      }

      // ----------------------------------------------
      // CATEGORY
      // ----------------------------------------------

      if (storyData.category_id) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name")
          .eq("id", storyData.category_id)
          .single();

        if (categoryError) {
          console.error(
            "Category error:",
            categoryError
          );
        } else {
          setCategory(categoryData);
        }
      }

      await checkReadingAccess(storyData.id);

      await checkLibrary(storyData.id);

      await checkExistingProgress(storyData.id);
    } catch (error) {
      console.error(
        "Failed to load story:",
        error
      );

      setStory(null);
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // CHECK READING ACCESS
  // --------------------------------------------------

  async function checkReadingAccess(currentStoryId) {
    try {
      setAccessChecking(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      // Logged out users can preview/read
      // but cannot save progress.
      if (!currentUser) {
        setCanRead(true);
        setMessage("");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        );
      }

      const premium =
        profile?.plan === "premium";

      setIsPremium(premium);

      // Premium users have unlimited access.
      if (premium) {
        setCanRead(true);
        setMessage("");
        return;
      }

      // Get all reading progress.
      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from("reading_progress")
        .select("book_id, story_id")
        .eq("user_id", currentUser.id);

      if (progressError) {
        console.error(
          "Reading progress error:",
          progressError
        );

        setCanRead(false);

        setMessage(
          "Unable to check your reading limit."
        );

        return;
      }

      const uniqueItems = new Set();

      (progressData || []).forEach((item) => {
        if (
          item.book_id !== null &&
          item.book_id !== undefined
        ) {
          uniqueItems.add(
            `book-${Number(item.book_id)}`
          );
        }

        if (
          item.story_id !== null &&
          item.story_id !== undefined
        ) {
          uniqueItems.add(
            `story-${Number(item.story_id)}`
          );
        }
      });

      const storyAlreadyStarted =
        uniqueItems.has(
          `story-${currentStoryId}`
        );

      // Existing story does not consume another slot.
      if (storyAlreadyStarted) {
        setCanRead(true);
        setMessage("");
        return;
      }

      // Free limit reached.
      if (
        uniqueItems.size >=
        FREE_READING_LIMIT
      ) {
        setCanRead(false);

        setMessage(
          "You have reached your free reading limit of 5 books/stories."
        );

        return;
      }

      setCanRead(true);
      setMessage("");
    } catch (error) {
      console.error(
        "Reading access error:",
        error
      );

      setCanRead(false);

      setMessage(
        "Unable to check your reading access."
      );
    } finally {
      setAccessChecking(false);
    }
  }

  // --------------------------------------------------
  // CHECK EXISTING READING PROGRESS
  // --------------------------------------------------

  async function checkExistingProgress(currentStoryId) {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("reading_progress")
        .select("id, progress")
        .eq("user_id", currentUser.id)
        .eq("story_id", currentStoryId)
        .maybeSingle();

      if (error) {
        console.error(
          "Existing progress error:",
          error
        );

        return;
      }

      if (data) {
        setReadingStarted(true);

        const progress =
          Number(data.progress) || 0;

        setReadingProgress(progress);

        if (progress >= 100) {
          setReadingCompleted(true);
        }
      }
    } catch (error) {
      console.error(
        "Check progress error:",
        error
      );
    }
  }

  // --------------------------------------------------
  // START READING
  // --------------------------------------------------

  async function startReading() {
    if (!story || !canRead) {
      return;
    }

    // Not logged in.
    if (!user) {
      document
        .getElementById("story-content")
        ?.scrollIntoView({
          behavior: "smooth",
        });

      return;
    }

    try {
      const {
        data: existingProgress,
        error: existingError,
      } = await supabase
        .from("reading_progress")
        .select("id, progress")
        .eq("user_id", user.id)
        .eq("story_id", story.id)
        .maybeSingle();

      if (existingError) {
        console.error(
          "Existing progress error:",
          existingError
        );

        return;
      }

      // Already started.
      if (existingProgress) {
        setReadingStarted(true);

        setReadingProgress(
          Number(
            existingProgress.progress
          ) || 0
        );

        if (
          Number(
            existingProgress.progress
          ) >= 100
        ) {
          setReadingCompleted(true);
        }

        scrollToStory();

        return;
      }

      // Create reading progress.
      const {
        error: insertError,
      } = await supabase
        .from("reading_progress")
        .insert({
          user_id: user.id,
          story_id: story.id,
          book_id: null,
          chapter_id: null,
          progress: 0,
        });

      if (insertError) {
        console.error(
          "Failed to create reading progress:",
          insertError
        );

        alert(
          insertError.message ||
            "Could not start reading."
        );

        return;
      }

      setReadingStarted(true);
      setReadingProgress(0);

      console.log(
        "Community story reading started."
      );

      await checkReadingAccess(story.id);

      scrollToStory();
    } catch (error) {
      console.error(
        "Start reading error:",
        error
      );
    }
  }

  // --------------------------------------------------
  // SCROLL TO STORY
  // --------------------------------------------------

  function scrollToStory() {
    setTimeout(() => {
      document
        .getElementById("story-content")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  }

  // --------------------------------------------------
  // TRACK READING PROGRESS
  // --------------------------------------------------

  useEffect(() => {
    if (!readingStarted || readingCompleted) {
      return;
    }

    function handleScroll() {
      const content =
        document.getElementById(
          "story-content"
        );

      if (!content) {
        return;
      }

      const rect =
        content.getBoundingClientRect();

      const contentTop =
        window.scrollY + rect.top;

      const contentHeight =
        content.offsetHeight;

      const viewportBottom =
        window.scrollY +
        window.innerHeight;

      const currentPosition =
        viewportBottom - contentTop;

      let percentage =
        (currentPosition /
          contentHeight) *
        100;

      percentage = Math.max(
        0,
        Math.min(
          100,
          Math.round(percentage)
        )
      );

      setReadingProgress(
        percentage
      );

      // User reached the end.
      if (percentage >= 95) {
        finishReading();
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    readingStarted,
    readingCompleted,
    story,
    user,
  ]);

  // --------------------------------------------------
  // FINISH READING
  // --------------------------------------------------

  async function finishReading() {
    if (
      !user ||
      !story ||
      readingCompleted
    ) {
      return;
    }

    try {
      // ----------------------------------------------
      // UPDATE READING PROGRESS TO 100
      // ----------------------------------------------

      const {
        error: progressError,
      } = await supabase
        .from("reading_progress")
        .update({
          progress: 100,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("story_id", story.id);

      if (progressError) {
        console.error(
          "Finish progress error:",
          progressError
        );

        return;
      }

      setReadingProgress(100);
      setReadingCompleted(true);

      console.log(
        "Story reading completed."
      );

      // ----------------------------------------------
      // CHECK IF ALREADY IN LIBRARY
      // ----------------------------------------------

      const {
        data: existingLibrary,
        error: libraryCheckError,
      } = await supabase
        .from("library")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", story.id)
        .maybeSingle();

      if (libraryCheckError) {
        console.error(
          "Library check after completion error:",
          libraryCheckError
        );

        return;
      }

      // Already saved.
      if (existingLibrary) {
        setInLibrary(true);

        console.log(
          "Story already exists in My Library."
        );

        return;
      }

      // ----------------------------------------------
      // ADD STORY TO LIBRARY
      // ----------------------------------------------

      const {
        error: libraryInsertError,
      } = await supabase
        .from("library")
        .insert({
          user_id: user.id,
          book_id: null,
          story_id: story.id,
        });

      if (libraryInsertError) {
        console.error(
          "Auto library insert error:",
          libraryInsertError
        );

        alert(
          libraryInsertError.message ||
            "Reading completed, but the story could not be added to your library."
        );

        return;
      }

      setInLibrary(true);

      console.log(
        "Story automatically added to My Library."
      );
    } catch (error) {
      console.error(
        "Finish reading error:",
        error
      );
    }
  }

  // --------------------------------------------------
  // CHECK LIBRARY
  // --------------------------------------------------

  async function checkLibrary(
    currentStoryId
  ) {
    try {
      setLibraryLoading(true);

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setInLibrary(false);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("library")
        .select("id")
        .eq(
          "user_id",
          currentUser.id
        )
        .eq(
          "story_id",
          currentStoryId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Library check error:",
          error
        );

        setInLibrary(false);
        return;
      }

      setInLibrary(!!data);
    } catch (error) {
      console.error(
        "Failed to check library:",
        error
      );

      setInLibrary(false);
    } finally {
      setLibraryLoading(false);
    }
  }

  // --------------------------------------------------
  // TOGGLE LIBRARY
  // --------------------------------------------------

  async function toggleLibrary() {
    if (!user) {
      alert(
        "Please login to add this story to your library."
      );

      return;
    }

    if (!story) {
      return;
    }

    try {
      setLibrarySaving(true);

      // REMOVE
      if (inLibrary) {
        const {
          error,
        } = await supabase
          .from("library")
          .delete()
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "story_id",
            story.id
          );

        if (error) {
          console.error(
            "Remove library error:",
            error
          );

          alert(
            error.message ||
              "Could not remove the story from your library."
          );

          return;
        }

        setInLibrary(false);

        return;
      }

      // CHECK DUPLICATE
      const {
        data: existing,
        error: existingError,
      } = await supabase
        .from("library")
        .select("id")
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "story_id",
          story.id
        )
        .maybeSingle();

      if (existingError) {
        console.error(
          "Existing library error:",
          existingError
        );

        return;
      }

      if (existing) {
        setInLibrary(true);
        return;
      }

      // ADD
      const {
        error: insertError,
      } = await supabase
        .from("library")
        .insert({
          user_id: user.id,
          story_id: story.id,
          book_id: null,
        });

      if (insertError) {
        console.error(
          "Add library error:",
          insertError
        );

        alert(
          insertError.message ||
            "Could not add this story to your library."
        );

        return;
      }

      setInLibrary(true);
    } catch (error) {
      console.error(
        "Library update error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while updating your library."
      );
    } finally {
      setLibrarySaving(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-4">
            📖
          </div>

          <p className="text-gray-600">
            Loading story...
          </p>

        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------

  if (!story) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center px-6">

          <div className="text-6xl mb-5">
            📚
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Story Not Found
          </h1>

          <p className="text-gray-500 mt-3">
            This story may have been removed
            or is not published yet.
          </p>

          <Link
            href="/books"
            className="inline-block mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            ← Back to Books
          </Link>

        </div>

      </main>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HERO */}

      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">

        <div className="max-w-5xl mx-auto px-6 py-12">

          <Link
            href="/books"
            className="text-purple-200 hover:text-white"
          >
            ← Back to Books
          </Link>

          <div className="mt-8">

            <span className="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm">
              ✍️ Community Story
            </span>

            <h1 className="text-4xl md:text-5xl font-bold mt-5">
              {story.title}
            </h1>

            <p className="text-purple-100 mt-4 text-lg">
              By{" "}
              {author?.name ||
                "Anonymous"}
            </p>

            {category?.name && (
              <p className="text-purple-200 mt-2">
                Category:{" "}
                {category.name}
              </p>
            )}

          </div>

        </div>

      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* READING STATUS */}

        <div className="bg-white border rounded-2xl p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex-1">

              {accessChecking ? (
                <>
                  <p className="font-semibold text-gray-900">
                    Checking reading access...
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    Please wait.
                  </p>
                </>
              ) : readingCompleted ? (
                <>
                  <p className="font-semibold text-green-700">
                    ✅ Reading Completed
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    This story has been added to
                    your reading history.
                  </p>
                </>
              ) : canRead ? (
                <>
                  <p className="font-semibold text-gray-900">
                    {isPremium
                      ? "👑 Premium Access"
                      : "📖 Reading Access"}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {isPremium
                      ? "You have unlimited access."
                      : user
                      ? "Read this story to add it to your reading history."
                      : "Login to save your reading progress."}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-900">
                    🔒 Reading Limit Reached
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {message}
                  </p>
                </>
              )}

              {/* PROGRESS BAR */}

              {readingStarted && (
                <div className="mt-4">

                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      Reading Progress
                    </span>

                    <span>
                      {readingProgress}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{
                        width: `${readingProgress}%`,
                      }}
                    />

                  </div>

                </div>
              )}

            </div>

            <div className="flex flex-wrap gap-3">

              {/* LIBRARY */}

              {libraryLoading ? (
                <button
                  disabled
                  className="bg-gray-200 text-gray-500 px-5 py-3 rounded-lg"
                >
                  Checking Library...
                </button>
              ) : (
                <button
                  onClick={toggleLibrary}
                  disabled={librarySaving}
                  className={`px-5 py-3 rounded-lg font-medium transition ${
                    inLibrary
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {librarySaving
                    ? "Saving..."
                    : inLibrary
                    ? "✓ Saved to Library"
                    : "📚 Add to Library"}
                </button>
              )}

              {/* START READING */}

              {canRead &&
                !readingCompleted && (
                  <button
                    onClick={
                      startReading
                    }
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                  >
                    📖{" "}
                    {readingStarted
                      ? "Continue Reading"
                      : "Start Reading"}
                  </button>
                )}

              {/* PREMIUM */}

              {!canRead &&
                !accessChecking && (
                  <Link
                    href="/premium"
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
                  >
                    👑 Upgrade to Premium
                  </Link>
                )}

            </div>

          </div>

        </div>

        {/* COVER */}

        {story.cover_url && (
          <div className="bg-white border rounded-2xl overflow-hidden mb-8">

            <img
              src={story.cover_url}
              alt={story.title}
              className="w-full max-h-[550px] object-contain bg-gray-100"
            />

          </div>
        )}

        {/* STORY CONTENT */}

        {canRead && (
          <article
            id="story-content"
            className="bg-white border rounded-2xl p-8 md:p-12"
          >

            <div className="mb-8 pb-6 border-b">

              <p className="text-sm text-purple-600 font-medium">
                COMMUNITY STORY
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {story.title}
              </h2>

              <p className="text-gray-500 mt-2">
                Written by{" "}
                {author?.name ||
                  "Anonymous"}
              </p>

            </div>

            <div className="prose prose-lg max-w-none">

              {story.content ? (
                story.content
                  .split("\n")
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
                        className="text-gray-700 leading-8 mb-6 whitespace-pre-wrap"
                      >
                        {paragraph}
                      </p>
                    )
                  )
              ) : (
                <p className="text-gray-500">
                  This story has no content yet.
                </p>
              )}

            </div>

            {/* END OF STORY */}

            <div className="mt-12 pt-8 border-t text-center">

              {readingCompleted ? (
                <>
                  <div className="text-5xl mb-4">
                    🎉
                  </div>

                  <h3 className="text-2xl font-bold text-green-700">
                    You finished this story!
                  </h3>

                  <p className="text-gray-500 mt-2">
                    This story has been added to
                    your My Library.
                  </p>

                  <Link
                    href="/library"
                    className="inline-block mt-5 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                  >
                    📚 Go to My Library
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-400">
                    Keep reading until the end
                    to complete this story.
                  </p>
                </>
              )}

            </div>

          </article>
        )}

      </div>

    </main>
  );
}