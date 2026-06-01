import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const BUSY_ANSWER =
  "The AI service is temporarily busy. Please try again in a moment.";
const MAX_ASK_TRANSCRIPT_CHARS = 100_000;

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

class GeminiRetriesExhaustedError extends Error {
  constructor(cause) {
    super("Gemini retries exhausted");
    this.name = "GeminiRetriesExhaustedError";
    this.cause = cause;
  }
}

function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorStatus(error) {
  if (error && typeof error.status === "number") {
    return error.status;
  }

  if (error?.cause && typeof error.cause.status === "number") {
    return error.cause.status;
  }

  return undefined;
}

function isRetryableGeminiError(error) {
  const status = getErrorStatus(error);
  return status !== undefined && RETRYABLE_STATUS_CODES.has(status);
}

function estimateTokensFromText(text) {
  return Math.ceil(text.length / 4);
}

function getRetryDelayMs(error) {
  const message = error?.message ?? String(error);
  const match = message.match(/retry in ([\d.]+)s/i);

  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000);
  }

  return RETRY_DELAY_MS;
}

function logGeminiError(context, error, attempt) {
  console.error(`Gemini ${context} Error (attempt ${attempt}):`);
  console.error(error);
  console.error("Gemini error status:", getErrorStatus(error));
  console.error("Gemini error message:", error?.message);
}

function truncateTranscriptForAsk(transcript) {
  if (transcript.length <= MAX_ASK_TRANSCRIPT_CHARS) {
    return transcript;
  }

  return `${transcript.slice(0, MAX_ASK_TRANSCRIPT_CHARS)}\n\n[Transcript truncated for length]`;
}

async function withGeminiRetry(operation, context = "API") {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (isRetryableGeminiError(error)) {
        logGeminiError(context, error, attempt);
      }

      const shouldRetry =
        isRetryableGeminiError(error) && attempt < MAX_ATTEMPTS;

      if (!shouldRetry) {
        if (isRetryableGeminiError(error)) {
          throw new GeminiRetriesExhaustedError(error);
        }

        throw error;
      }

      const retryDelayMs = getRetryDelayMs(error);
      console.log(
        `Gemini ${context}: retrying in ${retryDelayMs}ms (attempt ${attempt + 1}/${MAX_ATTEMPTS})`
      );
      await sleep(retryDelayMs);
    }
  }

  throw lastError ?? new GeminiRetriesExhaustedError();
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
  console.log("Gemini model:", GEMINI_MODEL);
  console.log("Transcript length:", transcript.length);

  return withGeminiRetry(async () => {
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
  }, "Summary");
}

function getQuotaExhaustedAnswer(error) {
  const status = getErrorStatus(error);
  const message = error?.message ?? "";

  if (status === 429 || message.includes("RESOURCE_EXHAUSTED")) {
    return "Gemini free-tier quota is exhausted for this model. Summary used your quota during upload. Wait about a minute and try again, or enable billing on Google AI Studio.";
  }

  return BUSY_ANSWER;
}

export async function askAnalysisQuestion(transcript, question) {
  const transcriptForPrompt = truncateTranscriptForAsk(transcript);

  console.log("Question:", question);
  console.log("Transcript chars:", transcript.length);

  try {
    return await withGeminiRetry(async () => {
      const ai = getGeminiClient();

      const prompt = `You are QuickTake, an AI assistant helping the user understand a meeting analysis.

Answer the user's question using ONLY the transcript below. If the transcript does not contain enough information, say that clearly. Be concise and helpful.

Transcript:
${transcriptForPrompt}

Question:
${question}`;

      const requestConfig = {
        temperature: 0.3,
      };

      console.log("Gemini model:", GEMINI_MODEL);
      console.log("Prompt chars:", prompt.length);
      console.log("Estimated input tokens:", estimateTokensFromText(prompt));
      console.log("Request config:", JSON.stringify(requestConfig));

      let response;

      try {
        response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: requestConfig,
        });
      } catch (error) {
        console.error(error);
        throw error;
      }

      console.log(
        "Gemini response usage:",
        JSON.stringify(response.usageMetadata ?? {}, null, 2)
      );
      console.log(
        "Gemini prompt feedback:",
        JSON.stringify(response.promptFeedback ?? {}, null, 2)
      );

      const answer = response.text?.trim();

      if (!answer) {
        console.error("Gemini Ask response failure: empty text in response");
        console.error("Full response:", JSON.stringify(response, null, 2));
        throw new Error("Empty response from Gemini");
      }

      return answer;
    }, "Ask");
  } catch (error) {
    if (error instanceof GeminiRetriesExhaustedError) {
      console.error(error);
      console.error(error.cause);
      return getQuotaExhaustedAnswer(error.cause);
    }

    console.error(error);
    throw error;
  }
}
