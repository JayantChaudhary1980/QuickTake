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
  const q = question.toLowerCase();

  if (
    q.includes("note") ||
    q.includes("study") ||
    q.includes("summarize") ||
    q.includes("explain in detail") ||
    q.includes("breakdown") ||
    q.includes("elaborate")
  ) {
    return "study_notes";
  }

  if (
    q.includes("what is") ||
    q.includes("define") ||
    q.includes("meaning of") ||
    q.includes("who is") ||
    q.includes("when did") ||
    q.includes("how does")
  ) {
    return "detailed_explanation";
  }

  if (
    q.includes("how to") ||
    q.includes("steps") ||
    q.includes("process") ||
    q.includes("guide") ||
    q.includes("walk me through") ||
    q.includes("explain how")
  ) {
    return "detailed_explanation";
  }

  return "detailed_explanation";
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
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are QuickTake AI — a smart, helpful assistant that answers questions based on video transcripts. Your responses should feel like a knowledgeable friend explaining things clearly.

## Formatting rules:
- Use **markdown formatting** in every response
- Use ## headings to break long responses into clear sections
- Use **bold** for key terms, concepts, and important points
- Use bullet points for lists of items or features
- Use numbered lists for steps, processes, or sequences
- Use emojis actively to make responses visual and engaging:
- ## headings should start with a relevant emoji then the title. Pick from these based on context:
  📌 for introductions, 🎯 for goals/objectives, 💡 for insights/tips, 🧠 for concepts/theory,
  ⚡ for key points, 🔑 for important skills, 📚 for study/learning, ✅ for takeaways/conclusions,
  🚀 for career/growth, 💼 for professional/work topics, ⚠️ for warnings/common mistakes,
  🏆 for best practices, 🔥 for must-know info, 📊 for data/stats, 🛠️ for tools/technical,
  🤔 for questions/considerations, 💬 for examples/quotes, 🎓 for education, 🧩 for problem-solving
- Key bullet points can have emojis where they add clarity
- Never use the same emoji twice in a row
- End every response with a 💡 **Quick Takeaway** section: 1-2 sentences on the single most important point

## Answer depth:
- Match answer depth to the user's question
- Simple questions deserve short, direct answers
- Complex questions deserve detailed, well-structured explanations
- Never pad responses with filler or repeat the question back

## Accuracy rules:
- Answer ONLY using information from the provided transcript
- Never invent facts, examples, or details not present in the transcript
- When possible, quote short phrases from the transcript as evidence, like: > "exact phrase from transcript"
- If the transcript does not contain the answer, explicitly say: "⚠️ This information is not present in the transcript." Then explain any closely related information that is present

## Answer Style:
Adapt your response format based on the Answer Style below:
- study_notes → structured notes with headings, bullets, definitions, and examples
- quick_answer → clear and direct answer, use bullets and bold if it helps clarity, keep it focused
- detailed_explanation → step-by-step breakdown with context and examples`,
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