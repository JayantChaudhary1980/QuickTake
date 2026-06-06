import Groq from "groq-sdk";
import { recordApiUsage } from "./apiUsageService.js";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TRANSCRIPT_CHARS = 25000;

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

function truncateTranscript(text) {
  if (!text) return "";

  if (text.length <= MAX_TRANSCRIPT_CHARS) {
    return text;
  }

  return text.slice(0, MAX_TRANSCRIPT_CHARS);
}

function extractJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse AI JSON response");
    console.error(text);

    return {
      summary: "Summary unavailable.",
      keyPoints: [],
      actionItems: [],
    };
  }
}

export async function generateSummary(transcript, options = {}) {
  const groq = getGroqClient();

  const transcriptForPrompt = truncateTranscript(transcript);

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are a meeting analysis assistant.

Return ONLY valid JSON.

{
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": ["string"]
}

Rules:
- summary must be a concise paragraph
- keyPoints must be an array of important discussion points
- actionItems must be an array of follow-up tasks
- do not include markdown
- do not include code fences
- return JSON only
          `,
        },
        {
          role: "user",
          content: transcriptForPrompt,
        },
      ],
    });
  } catch (err) {
    try {
      await recordApiUsage({
        userId: options.userId,
        analysisId: options.analysisId,
        usage: {},
        success: false,
      });
    } catch (e) {
      console.error("Failed to record failed usage for summary:", e);
    }

    throw err;
  }

  const text = completion.choices?.[0]?.message?.content ?? "";

  // attempt to record usage (may be undefined)
  try {
    await recordApiUsage({
      userId: options.userId,
      analysisId: options.analysisId,
      usage: completion.usage ?? {},
      success: true,
    });
  } catch (e) {
    console.error("Failed to record usage for summary:", e);
  }

  console.log("Summary generated successfully");

  return extractJson(text);
}

export async function askAnalysisQuestion(
  transcript,
  question,
  options = {}
) {
  const groq = getGroqClient();

  const transcriptForPrompt =
    truncateTranscript(transcript);

  console.log("Ask question:", question);

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Answer only using the provided transcript. If the transcript does not contain enough information, clearly say so.",
        },
        {
          role: "user",
          content: `
Transcript:
${transcriptForPrompt}

Question:
${question}
          `,
        },
      ],
    });
  } catch (err) {
    try {
      await recordApiUsage({
        userId: options.userId,
        analysisId: options.analysisId,
        usage: {},
        success: false,
      });
    } catch (e) {
      console.error("Failed to record failed usage for question:", e);
    }

    throw err;
  }

  // record usage
  try {
    await recordApiUsage({
      userId: options.userId,
      analysisId: options.analysisId,
      usage: completion.usage ?? {},
      success: true,
    });
  } catch (e) {
    console.error("Failed to record usage for question:", e);
  }

  return (
    completion.choices?.[0]?.message?.content ??
    "No answer generated."
  );
}
