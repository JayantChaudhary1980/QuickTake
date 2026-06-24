import { YoutubeTranscript } from "youtube-transcript";
import ytDlp from "yt-dlp-exec";
import fs from "fs";

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (!match) throw new Error("Invalid YouTube URL");
  return match[1];
}

// Method 1: youtube-transcript (captions)
async function tryYoutubeTranscript(url) {
  const videoId = extractVideoId(url);
  const items = await YoutubeTranscript.fetchTranscript(videoId);

  if (!items || items.length === 0) {
    throw new Error("No captions available");
  }

  const transcriptText = items
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const last = items[items.length - 1];
  const durationSeconds = Math.round((last.offset + last.duration) / 1000);

  return { type: "transcript", transcriptText, durationSeconds };
}

// Method 2: yt-dlp with cookies
async function tryYtDlp(url) {
  let durationSeconds = 0;
  try {
    const info = await ytDlp(url, { dumpSingleJson: true, cookies: "./cookies.txt" });
    durationSeconds = Math.round(Number(info?.duration) || 0);
  } catch (err) {
    console.warn("Failed to fetch metadata:", err.message);
  }

  const output = `temp-${Date.now()}.mp3`;
  await ytDlp(url, {
    extractAudio: true,
    audioFormat: "mp3",
    output,
    cookies: "./cookies.txt",
  });

  const buffer = fs.readFileSync(output);
  fs.unlinkSync(output);

  return { type: "audio", buffer, filename: output, mimetype: "audio/mpeg", durationSeconds };
}

// Main export: captions first, cookies fallback
export async function downloadYoutubeAudio(url) {
  try {
    console.log("Trying youtube-transcript...");
    return await tryYoutubeTranscript(url);
  } catch (err) {
    console.warn("youtube-transcript failed, falling back to yt-dlp:", err.message);
    return await tryYtDlp(url);
  }
}