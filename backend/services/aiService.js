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
      oneMinuteRead: "",
      thingsWorthRemembering: [],
    };
  }
}

function detectAnswerStyle(question) {
  const q = question.toLowerCase().trim();

  // Quiz / self-test
  if (
    q.includes("quiz") ||
    q.includes("test me") ||
    q.includes("mcq") ||
    q.includes("practice question") ||
    q.includes("questions from this topic")
  ) {
    return "quiz";
  }

  // Revision notes
  if (
    q.includes("revision") ||
    q.includes("notes") ||
    q.includes("study notes") ||
    q.includes("cheat sheet") ||
    q.includes("exam notes")
  ) {
    return "revision_notes";
  }

  // Simple explanation
  if (
    q.includes("simple terms") ||
    q.includes("simply") ||
    q.includes("easy words") ||
    q.includes("eli5") ||
    q.includes("explain simply")
  ) {
    return "simple_explanation";
  }

  // Summary
  if (
    q.includes("summary") ||
    q.includes("summarize") ||
    q.includes("main points") ||
    q.includes("key takeaways") ||
    q.includes("tldr")
  ) {
    return "summary";
  }

  // Extract what speaker/teacher said
  if (
    q.includes("what did") ||
    q.includes("speaker say") ||
    q.includes("teacher say") ||
    q.includes("focus on") ||
    q.includes("mention about") ||
    q.includes("what was said about")
  ) {
    return "speaker_extract";
  }

  // Comparison
  if (
    q.includes("compare") ||
    q.includes("difference between") ||
    q.includes("vs") ||
    q.includes("versus")
  ) {
    return "comparison";
  }

  // Process / guide
  if (
    q.includes("how to") ||
    q.includes("steps") ||
    q.includes("process") ||
    q.includes("guide") ||
    q.includes("walk me through")
  ) {
    return "how_to";
  }

  return "direct_answer";
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
You are an expert video content analyst.

Return ONLY valid JSON with no markdown, no code fences, nothing else.

{
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": ["string"],
  "oneMinuteRead": "string",
  "thingsWorthRemembering": ["string"]
}

Rules:
- summary: 3-5 sentence paragraph capturing the core message and value of the content
- keyPoints: 5-8 most important concepts, insights, or takeaways from the content
- actionItems: concrete next steps, things to learn, or actions the viewer should take after watching
- oneMinuteRead: a single short paragraph (3-4 sentences max) for someone who has no time — the absolute essence of the video
- thingsWorthRemembering: 3-5 memorable facts, quotes, or insights from the video that are genuinely worth retaining long-term
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

  const transcriptForPrompt = truncateTranscript(transcript);
  const answerStyle = detectAnswerStyle(question);

  console.log("Ask question:", question, "| Style:", answerStyle);

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
You are QuickTake AI.

Answer questions using ONLY the provided transcript.

The transcript is the source of truth.

Your goal is to help users understand, remember, and apply what was discussed.

Response style:

- Use clear markdown formatting.
- Use headings only when they improve readability.
- Use **bold** for important ideas.
- Use bullet points and numbered lists when useful.
- Use emojis naturally and only when they improve readability.
- Avoid emoji spam.
- Match the depth of the response to the question.

Accuracy:

- Answer only from information present in the transcript.
- Never invent facts, examples, quotes, definitions, or explanations.
- Prefer extracting information over generating new information.
- If the transcript does not contain the answer, clearly say:
  "⚠️ This information is not present in the transcript."
- Then provide any closely related information that is present.

Important:

- Answer the user's question directly.
- Do not write like a blog article.
- Avoid introductions, conclusions, background sections, and filler.
- Stay focused on the information relevant to the question.
- Do not repeat information unnecessarily.

Answer styles:

Answer Styles

quiz:
- Create a quiz only from transcript content.
- Generate 5-10 questions.
- Mix easy and difficult questions.
- Include answers at the end.
- Do not explain answers unless asked.

revision_notes:
- Create concise revision notes.
- Focus on concepts, facts, and takeaways.
- Use sections:
  - Main Idea
  - Key Points
  - Important Facts
  - Quick Revision

simple_explanation:
- Explain the topic in simple language.
- Assume the user is a beginner.
- Keep the explanation concise.
- Stay close to transcript wording.

summary:
- Summarize the most important information.
- Use 3-5 bullets.
- Focus only on high-value takeaways.

speaker_extract:
- Extract exactly what the speaker said about the requested topic.
- Do not add unrelated advice.
- Do not add your own opinions.
- Quote transcript phrases when useful.

comparison:
- Compare the items using only transcript information.
- Prefer a table when helpful.
- Highlight similarities and differences clearly.

how_to:
- Extract the process or steps mentioned in the transcript.
- Present them in order.
- Do not invent missing steps.

direct_answer:
- Answer immediately.
- Extract only relevant information.
- No filler.
- No unnecessary sections.

Special cases:

If the user asks:
"What did the speaker say about X?"
→ Extract only the transcript content related to X.

If the user asks:
"What should I focus on?"
→ List only the points emphasized by the speaker.

If the user asks:
"Summarize"
→ Return the most important information in 3-5 bullets.

Use a short "Quick Takeaway" only when it genuinely adds value.
`,
        },
        {
          role: "user",
          content: `Transcript:
${transcriptForPrompt}

Question:
${question}

Answer Style:
${answerStyle}`,
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