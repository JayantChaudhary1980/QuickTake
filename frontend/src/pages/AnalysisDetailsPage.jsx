import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, ListChecks, Sparkles, Trash2 } from "lucide-react";

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
import { deleteAnalysis, renameAnalysis } from "@/services/api";
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
              <p className="text-sm text-muted-foreground">
                {analysis.sourceType} ·{" "}
                {new Date(analysis.createdAt).toLocaleString()}
              </p>
              {!isEditing ? (
                <div className="flex items-center gap-3">
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
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
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {analysis.transcript || "No transcript available."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </main>

              <aside className="w-full shrink-0 lg:sticky lg:top-[5.5rem] lg:w-[min(100%,400px)] lg:max-w-[420px] lg:self-start">
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
