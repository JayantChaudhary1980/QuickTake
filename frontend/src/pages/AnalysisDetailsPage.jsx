import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, ListChecks, Sparkles, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";

import { AnalysisCopilot } from "@/components/analysis-copilot";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAnalysisById } from "@/services/api";
import { deleteAnalysis, renameAnalysis, shareAnalysis } from "@/services/api";
import { toast } from "sonner";

function AnalysisDetailsPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAnalysisById(id);
        if (isMounted) {
          setAnalysis(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load analysis"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const exportToPDF = async () => {
    if (!analysis) {
      toast.error("No analysis loaded to export");
      return;
    }

    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let cursorY = margin;
      const maxLineWidth = pageWidth - margin * 2;

      const addWrappedText = (text, opts = {}) => {
        const fontSize = opts.fontSize || 11;
        const bold = !!opts.bold;
        const localLineHeight = fontSize * 1.35;
        if (bold) doc.setFont(undefined, "bold");
        else doc.setFont(undefined, "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(String(text || ""), maxLineWidth);
        lines.forEach((line) => {
          if (cursorY + localLineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
            if (bold) doc.setFont(undefined, "bold");
            else doc.setFont(undefined, "normal");
            doc.setFontSize(fontSize);
          }
          doc.text(line, margin, cursorY);
          cursorY += localLineHeight;
        });
      };

      // Title (centered)
      doc.setFont(undefined, "bold");
      doc.setFontSize(18);
      doc.text("QuickTake Analysis Report", pageWidth / 2, cursorY, { align: "center" });
      cursorY += 26;

      // Divider
      doc.setLineWidth(0.6);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 12;

      // Analysis Title
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(analysis.title || "Untitled", margin, cursorY);
      cursorY += 18;

      // Metadata box
      const created = analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : "";
      const sourceType = analysis.sourceType || "";
      // prepare meta lines to measure height
      const metaLines1 = doc.splitTextToSize(`Created: ${created}`, maxLineWidth - 12);
      const metaLines2 = doc.splitTextToSize(`Source: ${sourceType}`, maxLineWidth - 12);
      const metaFont = 10;
      const metaLineHeight = metaFont * 1.25;
      const metaHeight = (metaLines1.length + metaLines2.length) * metaLineHeight + 12;

      if (cursorY + metaHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }

      // draw metadata box
      doc.setDrawColor(200);
      doc.rect(margin, cursorY, pageWidth - margin * 2, metaHeight);
      // write metadata inside box with small padding
      const metaTextX = margin + 6;
      let metaTextY = cursorY + 6 + metaFont;
      doc.setFontSize(metaFont);
      doc.setFont(undefined, "normal");
      metaLines1.forEach((ln) => {
        doc.text(ln, metaTextX, metaTextY);
        metaTextY += metaLineHeight;
      });
      metaLines2.forEach((ln) => {
        doc.text(ln, metaTextX, metaTextY);
        metaTextY += metaLineHeight;
      });

      cursorY += metaHeight + 12;

      // Summary
      addWrappedText("Summary", { fontSize: 13, bold: true });
      cursorY += 4;
      addWrappedText(analysis.summary || "No summary available.", { fontSize: 11 });
      cursorY += 10;

      // Key Points
      addWrappedText("Key Points", { fontSize: 13, bold: true });
      cursorY += 4;
      if (analysis.keyPoints?.length > 0) {
        analysis.keyPoints.forEach((kp) => addWrappedText(`• ${kp}`, { fontSize: 11 }));
      } else {
        addWrappedText("No key points available.", { fontSize: 11 });
      }
      cursorY += 10;

      // Action Items
      addWrappedText("Action Items", { fontSize: 13, bold: true });
      cursorY += 4;
      if (analysis.actionItems?.length > 0) {
        analysis.actionItems.forEach((ai) => addWrappedText(`• ${ai}`, { fontSize: 11 }));
      } else {
        addWrappedText("No action items available.", { fontSize: 11 });
      }
      cursorY += 10;

      // Transcript
      addWrappedText("Transcript", { fontSize: 13, bold: true });
      cursorY += 6;
      addWrappedText(analysis.transcript || "No transcript available.", { fontSize: 10 });

      // Footer text (Generated by QuickTake) and page numbers
      const pageCount = typeof doc.getNumberOfPages === "function" ? doc.getNumberOfPages() : doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        // Generated by QuickTake on left
        doc.text("Generated by QuickTake", margin, pageHeight - margin + 18);
        // Page numbers centered
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - margin + 18, { align: "center" });
      }

      const safeTitle = (analysis.title || "analysis").replace(/\s+/g, " ").trim();
      const fileName = `${safeTitle || "analysis"}.pdf`;
      doc.save(fileName);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed", err);
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const result = await shareAnalysis(id);
                  const url = result.url;
                  await navigator.clipboard.writeText(url);
                  toast.success("Share URL copied to clipboard");
                } catch (err) {
                  console.error(err);
                  toast.error(err instanceof Error ? err.message : "Failed to create share link");
                }
              }}
            >
              Share
            </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
              >
                Export PDF
              </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (isDeleting) return;

                const ok = window.confirm(
                  "Delete this analysis? This action cannot be undone."
                );

                if (!ok) return;

                setIsDeleting(true);

                try {
                  await deleteAnalysis(id);
                  toast.success("Analysis deleted");
                  navigate("/dashboard");
                } catch (err) {
                  console.error(err);
                  toast.error(err instanceof Error ? err.message : "Failed to delete analysis");
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              <Trash2 className="size-4 mr-2" /> Delete
            </Button>

            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading analysis...</p>
        )}

        {error && !isLoading && (
          <Card className="border-destructive/30">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link to="/dashboard">Return to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {analysis && !isLoading && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-violet-300">
                  {analysis.sourceType}
                </span>

                <span className="text-muted-foreground">
                  {new Date(analysis.createdAt).toLocaleString()}
                </span>
              </div>
              {!isEditing ? (
                <div className="flex items-center gap-3">
                  <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    {analysis.title}
                  </h1>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditTitle(analysis.title || "");
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="min-w-0" />
                  <Button
                    onClick={async () => {
                      if (isSavingTitle) return;
                      setIsSavingTitle(true);
                      try {
                        const updated = await renameAnalysis(id, editTitle.trim());
                        setAnalysis((prev) => ({ ...prev, title: updated.title }));
                        setIsEditing(false);
                        toast.success("Title updated");
                      } catch (err) {
                        console.error(err);
                        toast.error(err instanceof Error ? err.message : "Failed to update title");
                      } finally {
                        setIsSavingTitle(false);
                      }
                    }}
                    disabled={isSavingTitle}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-6 lg:flex-row">
              <main className="min-w-0 flex-1 space-y-6 lg:overflow-y-auto">
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="size-5 text-violet-400" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {analysis.summary || "No summary available."}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-border/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ListChecks className="size-5 text-violet-400" />
                        Key Points
                      </CardTitle>
                      <CardDescription>
                        Main topics from the analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysis.keyPoints?.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {analysis.keyPoints.map((point, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No key points available.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="size-5 text-violet-400" />
                        Action Items
                      </CardTitle>
                      <CardDescription>Follow-ups and next steps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysis.actionItems?.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {analysis.actionItems.map((item, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="mt-0.5 shrink-0 text-muted-foreground">
                                •
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No action items available.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="size-5 text-violet-400" />
                      Transcript
                    </CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-4 lg:max-h-none">
                      <p className="whitespace-pre-wrap text-[15px] leading-8">
                        {analysis.transcript.trim() || "No transcript available."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </main>

              <aside className="w-full shrink-0 lg:sticky lg:top-[5.5rem] lg:w-[360px] lg:max-w-[360px] lg:self-start">
                <AnalysisCopilot analysisId={id} />
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalysisDetailsPage;
