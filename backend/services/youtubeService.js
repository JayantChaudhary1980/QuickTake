import ytDlp from "yt-dlp-exec";
import fs from "fs";

export async function downloadYoutubeAudio(url) {
  // First fetch metadata to get duration. Support multiple metadata shapes.
  let durationSeconds = 0;
  try {
    const info = await ytDlp(url, { dumpSingleJson: true, jsRuntimes: "node" });
    if (info) {
      // common fields: duration, duration_seconds, or entries[0].duration
      if (typeof info.duration !== "undefined") {
        durationSeconds = Math.round(Number(info.duration) || 0);
      } else if (typeof info.duration_seconds !== "undefined") {
        durationSeconds = Math.round(Number(info.duration_seconds) || 0);
      } else if (Array.isArray(info.entries) && info.entries[0] && typeof info.entries[0].duration !== "undefined") {
        durationSeconds = Math.round(Number(info.entries[0].duration) || 0);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch youtube metadata:", err);
  }

  const output = `temp-${Date.now()}.mp3`;

  await ytDlp(url, {
    extractAudio: true,
    audioFormat: "mp3",
    output,
    jsRuntimes: "node",
  });

  const buffer = fs.readFileSync(output);

  fs.unlinkSync(output);

  return {
    buffer,
    filename: output,
    mimetype: "audio/mpeg",
    durationSeconds,
  };
}