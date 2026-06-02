import Groq from "groq-sdk";

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

export async function generateSummary(transcript) {
  const groq = getGroqClient();

  const transcriptForPrompt =
    truncateTranscript(transcript);

  console.log("Generating summary...");
  console.log(
    "Transcript length:",
    transcriptForPrompt.length
  );

  const completion =
    await groq.chat.completions.create({
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

  const text =
    completion.choices?.[0]?.message?.content ?? "";

  console.log(
    "Summary generated successfully"
  );

  return extractJson(text);
}

export async function askAnalysisQuestion(
  transcript,
  question
) {
  const groq = getGroqClient();

  const transcriptForPrompt =
    truncateTranscript(transcript);

  console.log("Ask question:", question);

  const completion =
    await groq.chat.completions.create({
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

  return (
    completion.choices?.[0]?.message?.content ??
    "No answer generated."
  );
}
