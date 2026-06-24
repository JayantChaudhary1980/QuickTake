import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!match) throw new Error("Invalid YouTube URL");
  return match[1];
}

export async function downloadYoutubeAudio(url) {
  const videoId = extractVideoId(url);
  const items = await YoutubeTranscript.fetchTranscript(videoId);

  if (!items || items.length === 0) {
    throw new Error("No captions available for this video");
  }

  const transcriptText = items
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const last = items[items.length - 1];
  const durationSeconds = Math.round((last.offset + last.duration) / 1000);

  return {
    type: "transcript",
    transcriptText,
    durationSeconds,
  };
}