"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FREE_READING_LIMIT = 5;

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [externalBooks, setExternalBooks] = useState([]);
  const [stories, setStories] = useState([]);

  const [search, setSearch] = useState("");
  const [storySearch, setStorySearch] = useState("");
  const [externalSearch, setExternalSearch] =
    useState("fiction");

  const [loading, setLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] =
    useState(true);
  const [externalLoading, setExternalLoading] =
    useState(false);

  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  /*
    Each item is stored like:

    book-1
    book-2
    story-5
    story-7

    This means books + community stories
    are counted together.
  */
  const [startedItems, setStartedItems] =
    useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setIsPremium(false);
        setStartedItems([]);
        return;
      }

      // Get user's plan
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

        setIsPremium(false);
      } else {
        setIsPremium(
          profile?.plan === "premium"
        );
      }

      /*
        Get both book_id and story_id.

        This is important because:
        - normal books count
        - writer stories count
      */
      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from("reading_progress")
        .select("book_id, story_id")
        .eq("user_id", user.id);

      if (progressError) {
        console.error(
          "Reading progress error:",
          progressError
        );

        setStartedItems([]);
        return;
      }

      const uniqueItems = new Set();

      (progressData || []).forEach((item) => {
        if (item.book_id !== null) {
          uniqueItems.add(
            `book-${Number(item.book_id)}`
          );
        }

        if (item.story_id !== null) {
          uniqueItems.add(
            `story-${Number(item.story_id)}`
          );
        }
      });

      setStartedItems([...uniqueItems]);
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        error
      );

      setIsPremium(false);
      setStartedItems([]);
    }
  }

  /*
    Fetch Readora books
  */
  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);

      const response = await fetch("/api/books");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch books"
        );
      }

      const fetchedBooks = Array.isArray(data)
        ? data
        : data.books || [];

      setBooks(fetchedBooks);
    } catch (error) {
      console.error(
        "Failed to fetch books:",
        error
      );

      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  /*
    Fetch community stories
  */
  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      setStoriesLoading(true);

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
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        });

      if (storyError) {
        throw storyError;
      }

      if (
        !storyData ||
        storyData.length === 0
      ) {
        setStories([]);
        return;
      }

      /*
        Get story authors
      */
      const userIds = [
        ...new Set(
          storyData
            .map((story) => story.user_id)
            .filter(Boolean)
        ),
      ];

      let profiles = [];

      if (userIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profileError) {
          console.error(
            "Profile fetch error:",
            profileError
          );
        } else {
          profiles = profileData || [];
        }
      }

      /*
        Get story categories
      */
      const categoryIds = [
        ...new Set(
          storyData
            .map(
              (story) => story.category_id
            )
            .filter(Boolean)
        ),
      ];

      let categories = [];

      if (categoryIds.length > 0) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds);

        if (categoryError) {
          console.error(
            "Category fetch error:",
            categoryError
          );
        } else {
          categories = categoryData || [];
        }
      }

      /*
        Format stories
      */
      const formattedStories =
        storyData.map((story) => {
          const author = profiles.find(
            (profile) =>
              profile.id === story.user_id
          );

          const category =
            categories.find(
              (item) =>
                item.id ===
                story.category_id
            );

          return {
            ...story,

            authorName:
              author?.name ||
              "Anonymous",

            categoryName:
              category?.name ||
              "General",
          };
        });

      setStories(formattedStories);
    } catch (error) {
      console.error(
        "Failed to fetch community stories:",
        error
      );

      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  }

  /*
    Fetch Open Library books
  */
  useEffect(() => {
    fetchExternalBooks(
      externalSearch
    );
  }, []);

  async function fetchExternalBooks(query) {
    if (!query.trim()) {
      return;
    }

    try {
      setExternalLoading(true);

      const response = await fetch(
        `/api/external-books?q=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch external books"
        );
      }

      const fetchedBooks = Array.isArray(data)
        ? data
        : data.books || [];

      setExternalBooks(fetchedBooks);
    } catch (error) {
      console.error(
        "External books error:",
        error
      );

      setExternalBooks([]);
    } finally {
      setExternalLoading(false);
    }
  }

  /*
    Search Readora books
  */
  const filteredBooks = books.filter(
    (book) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      return (
        book.title
          ?.toLowerCase()
          .includes(query) ||
        book.author
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  /*
    Search community stories
  */
  const filteredStories =
    stories.filter((story) => {
      const query = storySearch
        .trim()
        .toLowerCase();

      if (!query) {
        return true;
      }

      return (
        story.title
          ?.toLowerCase()
          .includes(query) ||
        story.authorName
          ?.toLowerCase()
          .includes(query) ||
        story.categoryName
          ?.toLowerCase()
          .includes(query)
      );
    });

  /*
    Check whether a normal book can be opened
  */
  function canAccessBook(book) {
    /*
      Premium users can read everything.
    */
    if (isPremium) {
      return true;
    }

    /*
      Premium books require premium.
    */
    if (book.isPremium) {
      return false;
    }

    /*
      Logged-out users can view the
      book details page.
    */
    if (!user) {
      return true;
    }

    const itemKey =
      `book-${Number(book.id)}`;

    /*
      Already started this book?
      Allow it even after reaching 5.
    */
    if (
      startedItems.includes(itemKey)
    ) {
      return true;
    }

    /*
      New book.
      Check total books + stories.
    */
    return (
      startedItems.length <
      FREE_READING_LIMIT
    );
  }

  /*
    Check whether a community story
    can be opened.
  */
  function canAccessStory(story) {
    /*
      Premium users have unlimited access.
    */
    if (isPremium) {
      return true;
    }

    /*
      Logged-out users can open/read
      community stories.
    */
    if (!user) {
      return true;
    }

    const itemKey =
      `story-${Number(story.id)}`;

    /*
      Already started?
      Always allow it.
    */
    if (
      startedItems.includes(itemKey)
    ) {
      return true;
    }

    /*
      New story.
      Count books + stories together.
    */
    return (
      startedItems.length <
      FREE_READING_LIMIT
    );
  }

  /*
    Book button text
  */
  function getBookButton(book) {
    if (isPremium) {
      return "📖 Read";
    }

    if (book.isPremium) {
      return "👑 Premium";
    }

    if (!user) {
      return "📖 View Book";
    }

    if (
      startedItems.includes(
        `book-${Number(book.id)}`
      )
    ) {
      return "📖 Continue Reading";
    }

    if (
      startedItems.length >=
      FREE_READING_LIMIT
    ) {
      return "🔒 Limit Reached";
    }

    return "📖 Read";
  }

  /*
    Story button text
  */
  function getStoryButton(story) {
    if (isPremium) {
      return "📖 Read Story";
    }

    if (!user) {
      return "📖 Read Story";
    }

    if (
      startedItems.includes(
        `story-${Number(story.id)}`
      )
    ) {
      return "📖 Continue Story";
    }

    if (
      startedItems.length >=
      FREE_READING_LIMIT
    ) {
      return "🔒 Limit Reached";
    }

    return "📖 Read Story";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            📚
          </div>

          <p className="text-gray-600">
            Loading books...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HERO ================= */}

      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">

        <div className="max-w-7xl mx-auto px-6 py-16">

          <p className="text-purple-200 font-medium mb-3">
            READORA LIBRARY
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Discover Your Next Story
          </h1>

          <p className="text-purple-100 mt-5 text-lg">
            Explore books, discover community
            stories, and start reading today.
          </p>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ================= READING PLAN ================= */}

        {!isPremium && (
          <div className="bg-white border border-purple-200 rounded-2xl p-6 mb-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  🆓 Free Plan
                </h2>

                <p className="text-gray-600 mt-1">

                  {user
                    ? `You have started ${startedItems.length} of ${FREE_READING_LIMIT} free books/stories.`
                    : `Free members can read up to ${FREE_READING_LIMIT} books or community stories.`}

                </p>

              </div>

              <Link
                href="/premium"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium text-center"
              >
                👑 Upgrade to Premium
              </Link>

            </div>

          </div>
        )}

        {isPremium && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-10">

            <h2 className="text-xl font-bold text-yellow-800">
              👑 Premium Member
            </h2>

            <p className="text-yellow-700 mt-1">
              You have unlimited access to
              Readora books and community stories.
            </p>

          </div>
        )}

        {/* ================= BOOK SEARCH ================= */}

        <section className="mb-12">

          <div className="bg-white rounded-2xl border p-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Readora Books
            </label>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by title or author..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

        </section>

        {/* ================= READORA BOOKS ================= */}

        <section className="mb-16">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-3xl font-bold text-gray-900">
                Popular Books
              </h2>

              <p className="text-gray-500 mt-1">
                Books available on Readora
              </p>

            </div>

            <span className="text-sm text-gray-500">
              {filteredBooks.length} books
            </span>

          </div>

          {filteredBooks.length === 0 ? (
            <div className="bg-white border rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h3 className="text-xl font-semibold">
                No books found
              </h3>

              <p className="text-gray-500 mt-2">
                Try another search.
              </p>

            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {filteredBooks.map(
                (book) => {
                  const accessible =
                    canAccessBook(book);

                  const buttonText =
                    getBookButton(book);

                  return (
                    <div
                      key={book.id}
                      className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition ${
                        accessible
                          ? "hover:shadow-lg"
                          : "opacity-80"
                      }`}
                    >

                      {/* Cover */}

                      <div className="h-64 bg-purple-100 relative overflow-hidden">

                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className={`w-full h-full object-cover ${
                              !accessible
                                ? "grayscale"
                                : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl">
                            📖
                          </div>
                        )}

                        {book.isPremium && (
                          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                            👑 Premium
                          </span>
                        )}

                        {!accessible && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">

                            <span className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold shadow">
                              🔒 Locked
                            </span>

                          </div>
                        )}

                      </div>

                      {/* Information */}

                      <div className="p-5">

                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {book.title}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          By{" "}
                          {book.author ||
                            "Unknown"}
                        </p>

                        {book.categoryName && (
                          <p className="text-sm text-purple-600 mt-2">
                            {
                              book.categoryName
                            }
                          </p>
                        )}

                        {accessible ? (
                          <Link
                            href={`/books/${book.id}`}
                            className="block text-center mt-5 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
                          >
                            {buttonText}
                          </Link>
                        ) : (
                          <Link
                            href="/premium"
                            className="block text-center mt-5 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300"
                          >
                            {buttonText}
                          </Link>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ================= PREMIUM ================= */}

        {!isPremium && (
          <section className="mb-16">

            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-8 md:p-10">

              <div className="max-w-3xl">

                <div className="text-4xl mb-4">
                  👑
                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Unlock Readora Premium
                </h2>

                <p className="text-gray-800 mt-3 text-lg">
                  Get unlimited reading access
                  and enjoy premium books and
                  community stories.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">

                  <span className="bg-white/70 px-4 py-2 rounded-full text-sm">
                    Unlimited Books
                  </span>

                  <span className="bg-white/70 px-4 py-2 rounded-full text-sm">
                    Premium Books
                  </span>

                  <span className="bg-white/70 px-4 py-2 rounded-full text-sm">
                    Community Stories
                  </span>

                </div>

                <Link
                  href="/premium"
                  className="inline-block mt-7 bg-gray-900 text-white px-7 py-3 rounded-xl hover:bg-gray-800 font-medium"
                >
                  Become Premium
                </Link>

              </div>

            </div>

          </section>
        )}

        {/* ================= COMMUNITY STORIES ================= */}

        <section className="mb-16">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">

            <div>

              <h2 className="text-3xl font-bold text-gray-900">
                Community Stories
              </h2>

              <p className="text-gray-500 mt-1">
                Stories written and published
                by Readora writers.
              </p>

            </div>

            <Link
              href="/write"
              className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 text-center"
            >
              ✍️ Write a Story
            </Link>

          </div>

          {/* Story Search */}

          <div className="bg-white border rounded-2xl p-5 mb-6">

            <input
              type="text"
              value={storySearch}
              onChange={(event) =>
                setStorySearch(
                  event.target.value
                )
              }
              placeholder="Search community stories..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
            />

          </div>

          {storiesLoading ? (
            <div className="bg-white border rounded-2xl p-10 text-center">

              <p className="text-gray-500">
                Loading community stories...
              </p>

            </div>
          ) : filteredStories.length ===
            0 ? (
            <div className="bg-white border rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                ✍️
              </div>

              <h3 className="text-xl font-semibold">
                No stories found
              </h3>

              <p className="text-gray-500 mt-2">
                Be the first to publish a
                story.
              </p>

            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredStories.map(
                (story) => {
                  const accessible =
                    canAccessStory(
                      story
                    );

                  const buttonText =
                    getStoryButton(
                      story
                    );

                  return (
                    <div
                      key={story.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition ${
                        accessible
                          ? "hover:shadow-lg"
                          : "opacity-80"
                      }`}
                    >

                      {/* Story Cover */}

                      <div className="h-48 bg-purple-100 flex items-center justify-center overflow-hidden relative">

                        {story.cover_url ? (
                          <img
                            src={
                              story.cover_url
                            }
                            alt={
                              story.title
                            }
                            className={`w-full h-full object-cover ${
                              !accessible
                                ? "grayscale"
                                : ""
                            }`}
                          />
                        ) : (
                          <span className="text-6xl">
                            ✍️
                          </span>
                        )}

                        {!accessible && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">

                            <span className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold shadow">
                              🔒 Locked
                            </span>

                          </div>
                        )}

                      </div>

                      {/* Story Information */}

                      <div className="p-5">

                        <span className="inline-block text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          {
                            story.categoryName
                          }
                        </span>

                        <h3 className="text-xl font-bold text-gray-900 mt-3 line-clamp-2">
                          {story.title}
                        </h3>

                        <p className="text-gray-500 mt-2">
                          By{" "}
                          {story.authorName}
                        </p>

                        <p className="text-gray-500 text-sm mt-3 line-clamp-3">
                          {story.content ||
                            "No description available."}
                        </p>

                        {accessible ? (
                          <Link
                            href={`/stories/${story.id}`}
                            className="block text-center mt-5 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700"
                          >
                            {
                              buttonText
                            }
                          </Link>
                        ) : (
                          <Link
                            href="/premium"
                            className="block text-center mt-5 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300"
                          >
                            {
                              buttonText
                            }
                          </Link>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ================= OPEN LIBRARY ================= */}

        <section className="pb-10">

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-gray-900">
              Free Online Books
            </h2>

            <p className="text-gray-500 mt-1">
              Discover books from Open Library.
            </p>

          </div>

          {/* External Search */}

          <div className="bg-white border rounded-2xl p-5 mb-6">

            <div className="flex flex-col md:flex-row gap-3">

              <input
                type="text"
                value={externalSearch}
                onChange={(event) =>
                  setExternalSearch(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    fetchExternalBooks(
                      externalSearch
                    );
                  }
                }}
                placeholder="Search Open Library..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={() =>
                  fetchExternalBooks(
                    externalSearch
                  )
                }
                disabled={
                  externalLoading
                }
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
              >
                {externalLoading
                  ? "Searching..."
                  : "Search"}
              </button>

            </div>

          </div>

          {externalLoading ? (
            <div className="bg-white border rounded-2xl p-10 text-center">

              <p className="text-gray-500">
                Loading free books...
              </p>

            </div>
          ) : externalBooks.length ===
            0 ? (
            <div className="bg-white border rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                📚
              </div>

              <h3 className="text-xl font-semibold">
                No external books found
              </h3>

            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {externalBooks.map(
                (book) => (
                  <div
                    key={book.id}
                    className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition"
                  >

                    <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">

                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={
                            book.title
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">
                          📖
                        </span>
                      )}

                    </div>

                    <div className="p-5">

                      <h3 className="font-bold text-lg line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        By{" "}
                        {book.author ||
                          "Unknown"}
                      </p>

                      {book.publishYear && (
                        <p className="text-sm text-gray-400 mt-2">
                          Published{" "}
                          {
                            book.publishYear
                          }
                        </p>
                      )}

                      <a
                        href={`https://openlibrary.org/books/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block text-center mt-5 px-4 py-2.5 rounded-lg ${
                          book.hasFulltext
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {book.hasFulltext
                          ? "📖 Read Online"
                          : "View Book"}
                      </a>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}