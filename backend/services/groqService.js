import Groq, { toFile } from "groq-sdk";
import { recordApiUsage } from "./apiUsageService.js";

const WHISPER_MODEL = "whisper-large-v3-turbo";

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

export async function transcribeAudio(buffer, originalname, mimetype, options = {}) {
  const groq = getGroqClient();
  const file = await toFile(buffer, originalname, { type: mimetype });

  let transcription;
  try {
    transcription = await groq.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      response_format: "json",
    });

    // try to record usage if available
    try {
      await recordApiUsage({
        userId: options.userId,
        analysisId: options.analysisId,
        usage: transcription.usage ?? {},
        success: true,
      });
    } catch (e) {
      console.error("Failed to record usage for transcription:", e);
    }

    return transcription.text ?? "";
  } catch (err) {
    try {
      await recordApiUsage({
        userId: options.userId,
        analysisId: options.analysisId,
        usage: {},
        success: false,
      });
    } catch (e) {
      console.error("Failed to record failed usage for transcription:", e);
    }

    throw err;
  }
}

