"use client";

import { useState } from "react";
import Link from "next/link";

const books = {
  1: {
    title: "The Silent Forest",
    author: "Maya Sharma",
    chapters: [
      {
        title: "Chapter 1: The Beginning",
        content: `
The forest was unusually quiet that morning.

Maya stood at the edge of the trees and looked into the distance. 
The tall trees moved gently with the wind, while sunlight passed 
through the leaves and touched the ground.

She had heard stories about this forest since she was a child.

People said that something mysterious lived deep inside it.

Maya had never believed those stories.

But today, she was about to discover that some stories were not 
just stories.
        `,
      },
      {
        title: "Chapter 2: Into the Forest",
        content: `
Maya slowly walked between the trees.

The path became narrower as she went deeper into the forest. 
Birds could be heard above her, but everything around her felt 
strangely peaceful.

After walking for almost an hour, she noticed something unusual.

There was an old wooden door standing between two trees.

There was no building.

Only the door.

Maya stepped closer.
        `,
      },
      {
        title: "Chapter 3: The Secret",
        content: `
The old door slowly opened.

Behind it was a narrow path covered with glowing flowers.

Maya looked around in disbelief.

She knew she had discovered something that nobody else had seen.

Taking a deep breath, she stepped through the door.

Her journey had finally begun.
        `,
      },
    ],
  },

  2: {
    title: "Beyond the Stars",
    author: "Alex Carter",
    chapters: [
      {
        title: "Chapter 1: The Sky",
        content: `
The night sky was brighter than usual.

Alex looked through the telescope and noticed something strange.

A small light was moving between the stars.

He had never seen anything like it before.

Then the light suddenly disappeared.
        `,
      },
      {
        title: "Chapter 2: The Message",
        content: `
The next morning, Alex found a strange symbol drawn on his window.

He immediately recognized it.

It was the same symbol he had seen beside the mysterious light.

Someone—or something—was trying to send him a message.
        `,
      },
    ],
  },
};

export default function ReaderPage({ params }) {
  const id = params.id;
  const book = books[id];

  const [currentChapter, setCurrentChapter] = useState(0);

  if (!book) {
    return (
      <main className="min-h-screen flex items-center justify-center">
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

  const chapter = book.chapters[currentChapter];

  const progress =
    ((currentChapter + 1) / book.chapters.length) * 100;

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Reader Header */}
      <header className="bg-white border-b sticky top-0 z-10">

        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            href={`/books/${id}`}
            className="text-purple-600 hover:underline"
          >
            ← Back
          </Link>

          <h1 className="font-bold text-gray-900">
            {book.title}
          </h1>

          <button className="text-gray-600 hover:text-purple-600">
            🔖
          </button>

        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-1 bg-purple-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

      </header>

      {/* Reader */}
      <section className="max-w-3xl mx-auto px-6 py-12">

        {/* Book Information */}
        <div className="text-center mb-12">

          <p className="text-gray-500">
            By {book.author}
          </p>

          <p className="text-sm text-purple-600 mt-2">
            Chapter {currentChapter + 1} of {book.chapters.length}
          </p>

        </div>

        {/* Chapter */}
        <article className="bg-white rounded-2xl shadow-sm px-8 md:px-14 py-12">

          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {chapter.title}
          </h2>

          <div className="text-lg text-gray-700 leading-9 whitespace-pre-line">
            {chapter.content}
          </div>

        </article>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">

          <button
            onClick={() =>
              setCurrentChapter((previous) => previous - 1)
            }
            disabled={currentChapter === 0}
            className="px-5 py-3 rounded-lg border bg-white disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-sm text-gray-500">
            {Math.round(progress)}% complete
          </span>

          <button
            onClick={() =>
              setCurrentChapter((previous) => previous + 1)
            }
            disabled={currentChapter === book.chapters.length - 1}
            className="px-5 py-3 rounded-lg bg-purple-600 text-white disabled:opacity-40"
          >
            Next →
          </button>

        </div>

      </section>

    </main>
  );
}