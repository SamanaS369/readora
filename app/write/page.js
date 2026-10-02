
"use client";

import { useState } from "react";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Fiction");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const saveDraft = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const acceptAISuggestion = (suggestion) => {
    setContent(suggestion);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white border rounded-2xl shadow-sm">

          {/* Story Information */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Story Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your story title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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

          {/* Story Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Story Content
              </h2>

              <span className="text-sm text-gray-500">
                {content.length} characters
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story here..."
              className="w-full min-h-[500px] border border-gray-300 rounded-xl p-5 text-lg leading-8 resize-y outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* AI Assistant */}
            <AIAssistant
              content={content}
              onAccept={acceptAISuggestion}
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t p-6">
            <div className="flex flex-wrap gap-4">

              {/* Save Draft */}
              <button
                onClick={saveDraft}
                className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50"
              >
                💾 Save Draft
              </button>

              {/* AI Button */}
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

              {/* Preview */}
              <button
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                👁️ Preview
              </button>

              {/* Publish */}
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                🚀 Publish Story
              </button>

            </div>

            {/* Saved Message */}
            {saved && (
              <p className="text-green-600 mt-4">
                ✓ Draft saved successfully!
              </p>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}
