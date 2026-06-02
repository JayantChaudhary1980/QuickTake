import ytDlp from "yt-dlp-exec";
import fs from "fs";

export async function downloadYoutubeAudio(url) {
  const output = `temp-${Date.now()}.mp3`;

  await ytDlp(url, {
    extractAudio: true,
    audioFormat: "mp3",
    output,
  });

  const buffer = fs.readFileSync(output);

  fs.unlinkSync(output);

  return {
    buffer,
    filename: output,
    mimetype: "audio/mpeg",
  };
}