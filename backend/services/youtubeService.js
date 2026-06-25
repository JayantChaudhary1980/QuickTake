import ytDlp from "yt-dlp-exec";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function downloadYoutubeAudio(url) {
  let durationSeconds = 0;

  // Update yt-dlp to latest version
  try {
    execSync(
      "/opt/render/project/src/backend/node_modules/yt-dlp-exec/bin/yt-dlp -U",
      { stdio: "ignore" }
    );
    console.log("yt-dlp updated successfully");
  } catch (e) {
    console.warn("yt-dlp update failed:", e.message);
  }

  // Write cookies from env var to a temp file
  const cookiesBase64 = process.env.YOUTUBE_COOKIES_BASE64;
  const cookiesPath = path.join("/tmp", "cookies.txt");
  if (cookiesBase64) {
    fs.writeFileSync(
      cookiesPath,
      Buffer.from(cookiesBase64, "base64").toString("utf-8")
    );
  }

  // Fetch metadata
  try {
    const info = await ytDlp(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      cookies: cookiesPath,
    });
    durationSeconds = Math.round(Number(info?.duration) || 0);
  } catch (err) {
    console.warn("Failed to fetch metadata:", err.message);
  }

  // Download audio
  const output = `/tmp/temp-${Date.now()}.mp3`;
  await ytDlp(url, {
    extractAudio: true,
    audioFormat: "mp3",
    output,
    cookies: cookiesPath,
    noCheckCertificates: true,
    noWarnings: true,
    format: "bestaudio/best",
  });

  const buffer = fs.readFileSync(output);
  fs.unlinkSync(output);

  return {
    type: "audio",
    buffer,
    filename: output,
    mimetype: "audio/mpeg",
    durationSeconds,
  };
}