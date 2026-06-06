import multer from "multer";
import path from "path";

const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".mp4", ".mkv", ".webm"];

const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "video/mp4",
  "video/x-matroska",
  "video/webm",
  "audio/webm",
];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowed =
      ALLOWED_EXTENSIONS.includes(ext) ||
      ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (isAllowed) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Unsupported file type. Allowed formats: MP3, WAV, M4A, MP4, MKV, WEBM"
      )
    );
  },
});

export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large. Maximum size is 100MB.",
      });
    }

    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
}
