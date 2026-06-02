import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

function YoutubeAnalysisPage() {
  const navigate = useNavigate();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canStart =
    youtubeUrl.trim().length > 0 &&
    title.trim().length > 0;

  const handleAnalyze = async () => {
    if (!canStart || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8000/api/analyses/youtube",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            url: youtubeUrl.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to process YouTube video"
        );
      }

      toast.success("Analysis created successfully");

      navigate(`/analysis/${data._id}`);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to process YouTube video";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
            Analyze YouTube Video
          </h1>

          <p className="mt-2 text-muted-foreground">
            Paste a YouTube URL for transcription and analysis.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Analysis details</CardTitle>

            <CardDescription>
              Paste a YouTube video link and we'll download the audio,
              generate a transcript, create a summary, and enable Q&A.
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
                placeholder="e.g. Lecture Summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="youtube-url"
                className="text-sm font-medium leading-none"
              >
                YouTube URL
              </label>

              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) =>
                  setYoutubeUrl(e.target.value)
                }
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              className="w-full sm:w-auto"
              disabled={!canStart || isSubmitting}
              onClick={handleAnalyze}
            >
              {isSubmitting
                ? "Analyzing..."
                : "Start Analysis"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default YoutubeAnalysisPage;