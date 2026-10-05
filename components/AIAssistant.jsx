"use client";

import { useState } from "react";

export default function AIAssistant({
  content,
  onAccept,
}) {
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const improveWriting = async () => {
    if (!content?.trim()) {
      setError("Please write something first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuggestion("");
      setShowSuggestion(false);

      const response = await fetch(
        "/api/improve-writing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      const result = await response.json();

      console.log(
        "AI writing response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to improve writing."
        );
      }

      if (!result.suggestion) {
        throw new Error(
          "AI did not return a corrected story."
        );
      }

      setSuggestion(result.suggestion);
      setShowSuggestion(true);
    } catch (error) {
      console.error(
        "Improve writing error:",
        error
      );

      setError(
        error.message ||
          "Failed to improve writing."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (!suggestion) {
      return;
    }

    onAccept(suggestion);
    setShowSuggestion(false);
  };

  const rejectSuggestion = () => {
    setSuggestion("");
    setShowSuggestion(false);
  };

  return (
    <div className="mt-6 border border-purple-200 bg-purple-50 rounded-2xl p-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            🤖 AI Grammar Assistant
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            Correct grammar, spelling, and punctuation
            without changing your story.
          </p>
        </div>

        <button
          type="button"
          onClick={improveWriting}
          disabled={loading}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Checking Grammar..."
            : "Correct Grammar"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
          {error}
        </div>
      )}

      {/* AI RESULT */}

      {showSuggestion && suggestion && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <p className="text-sm font-semibold text-gray-700 mb-3">
            ✨ Corrected Version
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 leading-7 whitespace-pre-wrap">
              {suggestion}
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3 mt-5">

            <button
              type="button"
              onClick={acceptSuggestion}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              ✓ Use Correction
            </button>

            <button
              type="button"
              onClick={rejectSuggestion}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              ✕ Keep Original
            </button>

          </div>

        </div>
      )}

    </div>
  );
}