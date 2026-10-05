import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Basic check for obviously meaningless/random text
function looksLikeRandomText(text) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return true;
  }

  const words = cleaned.split(" ");

  // Too little readable content
  if (cleaned.length < 30) {
    return true;
  }

  // One extremely long word is often random text
  const longestWord = Math.max(
    ...words.map((word) => word.length)
  );

  if (longestWord > 25) {
    return true;
  }

  // Calculate how much of the text contains vowels
  const letters = cleaned.replace(/\s/g, "");

  const vowelCount = (
    letters.match(/[aeiou]/g) || []
  ).length;

  const vowelRatio =
    letters.length > 0
      ? vowelCount / letters.length
      : 0;

  // Extremely unusual letter distribution
  if (letters.length > 20 && vowelRatio < 0.15) {
    return true;
  }

  // Detect excessive character repetition
  const repeatedPattern =
    /(.)\1{5,}/.test(cleaned);

  if (repeatedPattern) {
    return true;
  }

  return false;
}

export async function POST(request) {
  try {
    const { title, content, category } =
      await request.json();

    if (!title?.trim() || !content?.trim()) {
      return Response.json(
        {
          error:
            "Title and content are required.",
        },
        { status: 400 }
      );
    }

    /*
     * -----------------------------------------
     * BASIC QUALITY CHECK
     * -----------------------------------------
     */

    if (looksLikeRandomText(content)) {
      return Response.json({
        decision: "rejected",
        reason:
          "The submitted content appears to be random, meaningless, or not suitable as a readable story.",
        score: 0,
      });
    }

    /*
     * -----------------------------------------
     * GEMINI MODERATION
     * -----------------------------------------
     */

    const prompt = `
You are the moderation system for Readora,
an online story publishing platform.

Review the submitted story and classify it into
exactly one decision:

approved
needs_review
rejected

IMPORTANT:

A story should NOT be approved if it is:

- meaningless random characters
- keyboard spam
- random letters
- repeated meaningless text
- extremely low-quality unreadable content
- clearly not a story or meaningful written content

Normal fictional stories should NOT be rejected simply because
they contain:

- conflict
- villains
- fictional crime
- suspense
- sadness
- scary situations
- ordinary dramatic themes

Check for:

- harassment or hateful content
- seriously harmful or dangerous instructions
- spam
- clearly inappropriate content
- content that violates normal community rules
- meaningless or nonsensical writing

Rules:

approved:
The content is meaningful, readable, and suitable
for a general reading platform.

needs_review:
The content is readable but ambiguous or requires
human administrator judgment.

rejected:
The content is meaningless, clearly inappropriate,
spam, or clearly violates the moderation rules.

Return ONLY valid JSON:

{
  "decision": "approved",
  "reason": "Short explanation",
  "score": 95
}

The decision must be exactly:

approved
needs_review
rejected

The score must be an integer from 0 to 100.

Title:
${title}

Category:
${category}

Story:
${content}
`;

    let response;
    let lastError;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response =
          await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

        break;
      } catch (error) {
        lastError = error;

        const status =
          error?.status || error?.code;

        console.error(
          `Gemini attempt ${attempt + 1} failed:`,
          error
        );

        if (
          status !== 503 &&
          status !== 429
        ) {
          throw error;
        }

        if (attempt < 2) {
          const delay =
            2000 * Math.pow(2, attempt);

          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        }
      }
    }

    if (!response) {
      throw (
        lastError ||
        new Error(
          "Gemini request failed."
        )
      );
    }

    /*
     * -----------------------------------------
     * READ GEMINI RESULT
     * -----------------------------------------
     */

    let result;

    try {
      result = JSON.parse(
        response.text
      );
    } catch (parseError) {
      console.error(
        "Gemini JSON parsing error:",
        parseError
      );

      console.error(
        "Gemini output:",
        response.text
      );

      return Response.json(
        {
          error:
            "Gemini returned an invalid moderation response.",
        },
        { status: 500 }
      );
    }

    if (
      ![
        "approved",
        "needs_review",
        "rejected",
      ].includes(result.decision)
    ) {
      return Response.json(
        {
          error:
            "Invalid moderation decision returned by Gemini.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      decision: result.decision,
      reason:
        result.reason ||
        "No reason provided.",
      score: Number.isInteger(
        result.score
      )
        ? result.score
        : 50,
    });
  } catch (error) {
    console.error(
      "Gemini moderation error:",
      error
    );

    return Response.json(
      {
        error:
          error?.message ||
          "Story moderation failed.",
      },
      { status: 500 }
    );
  }
}