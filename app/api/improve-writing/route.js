import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();

    const content = body?.content;

    if (!content || !content.trim()) {
      return Response.json(
        {
          error: "Please write something first.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are a grammar correction tool for an online writing platform.

Correct ONLY:
- grammar
- spelling
- punctuation
- capitalization

Rules:
- Keep the exact meaning of the story.
- Do not add new information.
- Do not remove information.
- Do not create new sentences unless necessary to fix grammar.
- Do not change characters or events.
- Do not make the writing more creative.
- Do not summarize.
- Do not rewrite the author's style.
- Keep paragraph structure as much as possible.

Return ONLY the corrected story.
Do not explain your changes.
Do not add "Here is the corrected version".
Do not use quotation marks around the response.

Story:

${content}
`;

    let response = null;
    let lastError = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            temperature: 0.1,
          },
        });

        break;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini attempt ${attempt + 1} failed:`,
          error
        );

        const status =
          error?.status ||
          error?.code ||
          error?.response?.status;

        if (
          status !== 429 &&
          status !== 503
        ) {
          throw error;
        }

        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              2000 * Math.pow(2, attempt)
            )
          );
        }
      }
    }

    if (!response) {
      throw (
        lastError ||
        new Error("Gemini request failed.")
      );
    }

    const correctedText =
      response.text?.trim();

    if (!correctedText) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return Response.json({
      suggestion: correctedText,
    });
  } catch (error) {
    console.error(
      "Improve writing API error:",
      error
    );

    return Response.json(
      {
        error:
          error?.message ||
          "Failed to improve writing.",
      },
      { status: 500 }
    );
  }
}