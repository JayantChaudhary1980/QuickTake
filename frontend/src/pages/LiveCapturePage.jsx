import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Radio, StopCircle } from "lucide-react";

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

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

function LiveCapturePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordedType, setRecordedType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;
    setElapsed(Date.now() - startTimeRef.current);
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(tick, 500);
  }, [tick]);

  const stopTimer = useCallback(() => {
    startTimeRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCapture = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // If displayStream has no audio, try to add microphone as fallback
      if (displayStream.getAudioTracks().length === 0) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          mic.getAudioTracks().forEach((t) => displayStream.addTrack(t));
        } catch (err) {
          // ignore mic fallback failure
        }
      }

      streamRef.current = displayStream;

      const options = { mimeType: "video/webm;codecs=opus" };
      let mr;

      try {
        mr = new MediaRecorder(displayStream, options);
      } catch (err) {
        mr = new MediaRecorder(displayStream);
      }

      const localChunks = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          localChunks.push(e.data);
        }
      };

      mr.onstart = () => {
        setIsRecording(true);
        setChunks([]);
        setRecordedUrl(null);
        setRecordedType(null);
        startTimer();
      };

      mr.onstop = () => {
        stopTimer();
        setIsRecording(false);
        // stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const blob = new Blob(localChunks, { type: localChunks[0]?.type || "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedType(blob.type || "video/webm");
        setChunks(localChunks.slice());
      };

      mr.start();
      setRecorder(mr);
    } catch (error) {
      console.error("Start capture failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start capture"
      );
    }
  };

  const stopCapture = () => {
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const uploadRecording = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title before uploading");
      return;
    }

    if (!chunks || chunks.length === 0) {
      toast.error("No recording available to upload");
      return;
    }

    setIsUploading(true);

    try {
      const blob = new Blob(chunks, { type: recordedType || "video/webm" });
      const file = new File([blob], `live_capture_${Date.now()}.webm`, {
        type: blob.type,
      });

      await uploadAnalysis({ title: title.trim(), file, sourceType: "LIVE_CAPTURE" });

      toast.success("Live capture uploaded and analysis started");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
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
            Live Capture
          </h1>
          <p className="mt-2 text-muted-foreground">
            Capture a tab or window (including tab audio when available), stop, and upload for analysis.
          </p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recording</CardTitle>
            <CardDescription>
              Use the controls below to start and stop recording.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="analysis-title" className="text-sm font-medium leading-none">
                Analysis Title
              </label>
              <Input id="analysis-title" placeholder="e.g. Q2 roadmap review" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={startCapture} disabled={isRecording} variant="outline">
                <Radio className="size-4 mr-2 text-rose-500" /> Start Capture
              </Button>

              <Button onClick={stopCapture} disabled={!isRecording} variant="destructive">
                <StopCircle className="size-4 mr-2" /> Stop Capture
              </Button>

              <div className="ml-auto flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded-full", isRecording ? "bg-rose-500" : "bg-muted-foreground")} />
                <span className="text-sm text-muted-foreground">{isRecording ? "Recording" : "Idle"}</span>
                <span className="ml-3 text-sm text-muted-foreground">{formatElapsed(elapsed)}</span>
              </div>
            </div>

            {recordedUrl && (
              <div>
                {recordedType?.startsWith("video") ? (
                  <video src={recordedUrl} controls className="w-full rounded-md" />
                ) : (
                  <audio src={recordedUrl} controls className="w-full" />
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={uploadRecording} disabled={isUploading || !recordedUrl} className="w-full">
                {isUploading ? "Uploading..." : "Upload for Analysis"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (recordedUrl) {
                    URL.revokeObjectURL(recordedUrl);
                    setRecordedUrl(null);
                    setChunks([]);
                    setRecordedType(null);
                  }
                }}
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default LiveCapturePage;
