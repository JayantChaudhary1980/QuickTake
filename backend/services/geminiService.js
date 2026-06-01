import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";

const SUMMARY_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    keyPoints: {
      type: "array",
      items: { type: "string" },
    },
    actionItems: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["summary", "keyPoints", "actionItems"],
};

let geminiClient = null;

function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
}

function parseSummaryResponse(text) {
  if (!text?.trim()) {
    throw new Error("Empty response from Gemini");
  }

  let raw = text.trim();
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenceMatch) {
    raw = fenceMatch[1].trim();
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse Gemini summary response as JSON");
  }

  const isValidShape =
    typeof parsed.summary === "string" &&
    Array.isArray(parsed.keyPoints) &&
    Array.isArray(parsed.actionItems) &&
    parsed.keyPoints.every((item) => typeof item === "string") &&
    parsed.actionItems.every((item) => typeof item === "string");

  if (!isValidShape) {
    throw new Error("Invalid summary response shape from Gemini");
  }

  return {
    summary: parsed.summary,
    keyPoints: parsed.keyPoints,
    actionItems: parsed.actionItems,
  };
}

export async function generateSummary(transcript) {
  const ai = getGeminiClient();

  const prompt = `Analyze the following meeting transcript and return ONLY valid JSON in this exact shape with no markdown, no code fences, and no extra text:

{
  "summary": "...",
  "keyPoints": ["..."],
  "actionItems": ["..."]
}

Requirements:
- summary: a concise paragraph summarizing the meeting
- keyPoints: an array of the most important discussion points
- actionItems: an array of clear follow-up tasks or decisions

Transcript:
${transcript}`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: SUMMARY_JSON_SCHEMA,
      temperature: 0.2,
    },
  });

  return parseSummaryResponse(response.text);
}
