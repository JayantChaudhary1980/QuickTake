import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, Radio, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sourceOptions = [
  {
    id: "upload",
    title: "Upload Audio / Video",
    description: "Import a recording from your device",
    icon: Upload,
  },
  {
    id: "youtube",
    title: "YouTube Link",
    description: "Paste a URL to analyze a video",
    icon: Link2,
  },
  {
    id: "live",
    title: "Live Capture",
    description: "Record and analyze in real time",
    icon: Radio,
  },
];

export function NewAnalysisDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!open) {
      setSelectedOption(null);
    }
  }, [open]);

  const handleContinue = () => {
    if (!selectedOption) return;

    if (selectedOption === "upload") {
      navigate("/analysis/new/upload");
    }

    if (selectedOption === "youtube") {
      navigate("/youtube");
    }

    if (selectedOption === "live") {
      navigate("/analysis/new/live");
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Analysis</DialogTitle>
          <DialogDescription>
            Choose how you want to capture content for analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          {sourceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "flex min-h-36 flex-col items-start gap-3 rounded-xl border p-5 text-left transition-colors",
                  "hover:border-violet-500/40 hover:bg-muted/50",
                  isSelected
                    ? "border-violet-500 bg-violet-600/15 dark:bg-violet-500/10 ring-2 ring-violet-500/30"
                    : "border-border/60 bg-card"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-violet-500/20 text-violet-600 dark:text-violet-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{option.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedOption} onClick={handleContinue}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
