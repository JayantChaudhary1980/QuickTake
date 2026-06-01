import Groq, { toFile } from "groq-sdk";

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

export async function transcribeAudio(buffer, originalname, mimetype) {
  const groq = getGroqClient();
  const file = await toFile(buffer, originalname, { type: mimetype });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    response_format: "json",
  });

  return transcription.text ?? "";
}
