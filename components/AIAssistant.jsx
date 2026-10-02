"use client";

import { useState } from "react";

export default function AIAssistant({ content, onAccept }) {
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const improveWriting = () => {
    if (!content.trim()) {
      alert("Please write something first.");
      return;
    }

    // Temporary sample suggestion.
    // Later, this will be replaced with a real AI API.
    setSuggestion(
      "The story begins with a beautiful and mysterious atmosphere that immediately captures the reader's attention."
    );

    setShowSuggestion(true);
  };

  const acceptSuggestion = () => {
    onAccept(suggestion);
    setShowSuggestion(false);
  };

  const rejectSuggestion = () => {
    setSuggestion("");
    setShowSuggestion(false);
  };

  return (
    <div className="mt-6 border border-purple-200 bg-purple-50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            🤖 AI Writing Assistant
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Improve your writing with AI suggestions.
          </p>
        </div>

        <button
          onClick={improveWriting}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"
        >
          Improve Writing
        </button>
      </div>

      {showSuggestion && (
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            AI Suggestion
          </p>

          <p className="text-gray-800 leading-7">
            {suggestion}
          </p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={acceptSuggestion}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              ✓ Accept
            </button>

            <button
              onClick={rejectSuggestion}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}