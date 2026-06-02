import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8000/api/analyses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setAnalyses(data);
      setFilteredAnalyses(data);
    } catch (error) {
      console.error(error);
      setAnalyses([]);
      setFilteredAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    const filtered = analyses.filter((analysis) =>
      analysis.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredAnalyses(filtered);
  }, [search, analyses]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
            <ArrowLeft className="size-4" />
            Back
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">
                    History
                </h1>

                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    {filteredAnalyses.length}
                </span>
                </div>
            <p className="mt-1 text-muted-foreground">
              Browse all your previous analyses
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-80 rounded-md border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">
            Loading analyses...
          </p>
        ) : filteredAnalyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No analyses found.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-border px-6 py-4 text-sm font-medium text-muted-foreground">
                <div>Title</div>
                <div>Type</div>
                <div>Status</div>
                <div>Date</div>
              </div>

              {filteredAnalyses.map((analysis) => (
                <Link
                  key={analysis._id}
                  to={`/analysis/${analysis._id}`}
                  className="group block"
                >
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-border/40 px-6 py-4 transition-colors hover:bg-muted/40">
                    <div className="truncate font-medium transition-colors group-hover:text-violet-400">
                      {analysis.title}
                    </div>

                    <div className="text-muted-foreground">
                      {analysis.sourceType === "LIVE_CAPTURE"
                        ? "Live Capture"
                        : "Upload"}
                    </div>

                    <div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          analysis.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {analysis.status === "COMPLETED"
                          ? "Complete"
                          : "Processing"}
                      </span>
                    </div>

                    <div className="text-muted-foreground">
                      {new Date(
                        analysis.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;