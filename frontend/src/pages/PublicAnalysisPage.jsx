import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, ListChecks, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPublicAnalysis } from "@/services/api";

function PublicAnalysisPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPublicAnalysis(id);
        if (isMounted) setAnalysis(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load public analysis");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {analysis && (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">{analysis.sourceType} · {new Date(analysis.createdAt).toLocaleDateString()}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{analysis.title}</h1>
            </div>

            <main className="space-y-6">
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
                  </CardHeader>
                  <CardContent>
                    {analysis.keyPoints?.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {analysis.keyPoints.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No key points available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="size-5 text-violet-400" />
                      Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-muted/20 p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{analysis.transcript}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </>
        )}
      </main>
    </div>
  );
}

export default PublicAnalysisPage;
