import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileAudio, Upload } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadAnalysis } from "@/services/api";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".mp3", ".wav", ".m4a", ".mp4", ".mkv", ".webm"];

const ACCEPTED_MIME_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "video/mp4",
  "video/x-matroska",
  "video/webm",
];

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename) {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function isAcceptedFile(file) {
  const ext = getFileExtension(file.name);
  if (ACCEPTED_EXTENSIONS.includes(ext)) return true;
  return ACCEPTED_MIME_TYPES.includes(file.type);
}

function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const canStart = title.trim().length > 0 && file !== null;

  const handleFile = useCallback((selectedFile) => {
    if (!selectedFile || !isAcceptedFile(selectedFile)) {
      return;
    }
    setFile(selectedFile);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFile = event.dataTransfer.files?.[0];
      handleFile(droppedFile);
    },
    [handleFile]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onBrowseChange = (event) => {
    const selectedFile = event.target.files?.[0];
    handleFile(selectedFile);
    event.target.value = "";
  };

  const handleStartAnalysis = async () => {
    if (!canStart || isLoading) return;

    setIsLoading(true);

    try {
      await uploadAnalysis({
        title: title.trim(),
        file,
      });

      toast.success("Analysis created successfully");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload analysis"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Upload Content
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload an audio or video file for transcription and analysis.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Analysis details</CardTitle>
            <CardDescription>
              Supported formats: MP3, WAV, M4A, MP4, MKV, WEBM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="analysis-title"
                className="text-sm font-medium leading-none"
              >
                Analysis Title
              </label>
              <Input
                id="analysis-title"
                placeholder="e.g. Q2 roadmap review"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium leading-none">Media file</p>
              <div
                role="button"
                tabIndex={0}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
                className={cn(
                  "flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:min-h-56",
                  isDragging
                    ? "border-violet-500 bg-violet-600/15 dark:bg-violet-500/10"
                    : "border-border/60 bg-muted/20 hover:border-violet-500/40 hover:bg-muted/40"
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="size-6 text-muted-foreground" />
                </span>
                <div>
                  <p className="font-medium">Drag and drop your file here</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or use the button below to browse
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(",")}
                  className="sr-only"
                  onChange={onBrowseChange}
                />
              </div>
            </div>

            {file && (
              <div className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-600/30 dark:bg-violet-600/20 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <FileAudio className="size-5" />
                </span>
                <div className="min-w-0 flex-1 space-y-1 text-sm">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-muted-foreground">
                    Size: {formatFileSize(file.size)}
                  </p>
                  <p className="text-muted-foreground">
                    Type:{" "}
                    {getFileExtension(file.name).replace(".", "").toUpperCase() ||
                      file.type ||
                      "Unknown"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            <Button
              className="w-full sm:w-auto"
              disabled={!canStart || isLoading}
              onClick={handleStartAnalysis}
            >
              {isLoading ? "Uploading..." : "Start Analysis"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default UploadPage;
