import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Zap,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { NewAnalysisDialog } from "@/components/new-analysis-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getHealth, getAnalysisStats } from "@/services/api";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "new-analysis", label: "New Analysis", icon: Plus },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

const recentAnalyses = [
  {
    id: "1",
    title: "Q2 Roadmap Review",
    type: "Meeting",
    time: "2 hours ago",
    status: "Complete",
  },
  {
    id: "2",
    title: "Product Demo Walkthrough",
    type: "Screen + Video",
    time: "Yesterday",
    status: "Complete",
  },
  {
    id: "3",
    title: "Customer Discovery Call",
    type: "Meeting",
    time: "Mar 28, 2026",
    status: "Processing",
  },
  {
    id: "4",
    title: "YouTube: AI Tools Overview",
    type: "YouTube",
    time: "Mar 26, 2026",
    status: "Complete",
  },
];

function DashboardPage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendOk, setBackendOk] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ totalAnalyses: 0, thisWeek: 0, hoursSaved: 0 });

  const filteredAnalyses = analyses.filter((a) => {
    if (!search.trim()) return true;
    return (a.title || "").toLowerCase().includes(search.trim().toLowerCase());
  });

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
  
      console.log("Analyses:", data);
  
      setAnalyses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const createAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(
        "http://localhost:8000/api/analyses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "My First Analysis",
            sourceType: "UPLOAD",
          }),
        }
      );
  
      const data = await response.json();
  
      console.log("Analysis Created:", data);

      fetchAnalyses();
  
      alert("Analysis Created Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to create analysis");
    }
  };

  useEffect(() => {
    getHealth()
      .then((data) => {
        if (data.status === "ok") {
          setBackendOk(true);
        }
      })
      .catch(() => {
        setBackendOk(false);
      });
  
    fetchAnalyses();
    (async () => {
      try {
        const s = await getAnalysisStats();
        setStats({
          totalAnalyses: s.totalAnalyses ?? 0,
          thisWeek: s.thisWeek ?? 0,
          hoursSaved: s.hoursSaved ?? 0,
        });
      } catch (err) {
        console.error("Failed to load analysis stats:", err);
      }
    })();
  }, []);

  console.log("Analyses State:", analyses);

  const displayTime =
    stats.hoursSaved < 1
      ? `${Math.max(1, Math.round(stats.hoursSaved * 60))} min`
      : `${stats.hoursSaved.toFixed(1)} hr`;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <NewAnalysisDialog
        open={newAnalysisOpen}
        onOpenChange={setNewAnalysisOpen}
      />

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
        <SidebarContent
          analyses={analyses}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onNewAnalysis={() => setNewAnalysisOpen(true)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-20 items-center gap-3 border-b border-border/60 px-6 md:px-10">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0" showCloseButton>
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent
                analyses={analyses}
                activeNav={activeNav}
                onNavChange={(id) => {
                  setActiveNav(id);
                  setMobileOpen(false);
                }}
                onNewAnalysis={() => setNewAnalysisOpen(true)}
                className="h-full"
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-bold tracking-tight">
              {navItems.find((item) => item.id === activeNav)?.label ?? "Dashboard"}
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Manage analyses and review insights
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button
              className="md:hidden"
              size="sm"
              onClick={() => setNewAnalysisOpen(true)}
            >
              <Plus className="size-4" />
              New
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {backendOk && (
              <p className="text-sm font-medium text-emerald-500">
                Backend Status: OK
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total analyses" value={stats.totalAnalyses} />
              <StatCard label="This week" value={stats.thisWeek} />
              <StatCard label="Hours saved" value={displayTime || 0} />
            </div>

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Recent Analyses
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Pick up where you left off or start something new
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      aria-label="Search"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64 rounded-md border border-input bg-transparent py-2 pl-10 pr-3 text-sm"
                    />
                  </div>
                
                  <Button
                  className="hidden sm:inline-flex"
                  onClick={() => setNewAnalysisOpen(true)}
                >
                  <Plus className="size-4" />
                  New Analysis
                </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAnalyses.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-sm text-muted-foreground">No analyses found</div>
                ) : (
                  filteredAnalyses.slice(0,4).map((analysis) => (
                  <Link
                    key={analysis._id}
                    to={`/analysis/${analysis._id}`}
                    className="block"
                  >
                    <Card className="h-full cursor-pointer border-border/60 transition-colors hover:border-violet-500/30 hover:bg-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">
                            {analysis.title}
                          </CardTitle>
                          <StatusBadge
                            status={
                              analysis.status === "COMPLETED"
                                ? "Complete"
                                : "Processing"
                            }
                          />
                        </div>
                        <CardDescription>{analysis.sourceType}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <Clock className="size-3.5 shrink-0" />
                          <div className="flex flex-col leading-tight">
                            <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">{formatDuration(analysis.durationSeconds)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  to="/history"
                  className="text-sm font-medium text-white transition-colors hover:text-violet-400"
                >
                  View all analyses →
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  analyses,
  activeNav,
  onNavChange,
  onNewAnalysis,
  className,
}) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2 px-4 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">QuickTake</span>
      </div>

      <div className="px-3">
        <Button
          className="w-full justify-start gap-2"
          size="lg"
          onClick={onNewAnalysis}
        >
          <Plus className="size-4" />
          New Analysis
        </Button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          if (item.id === "history") {
            return (
              <Button
                key={item.id}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 font-normal",
                  isActive && "bg-secondary"
                )}
              >
                <Link to="/history" onClick={() => onNavChange(item.id)}>
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </Button>
            );
          }

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 font-normal",
                isActive && "bg-secondary"
              )}
              onClick={() => {
                if (item.id === "new-analysis") {
                  onNewAnalysis();
                } else {
                  onNavChange(item.id);
                }
              }}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <div className="flex min-h-0 flex-1 flex-col px-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent
        </p>
        <ul className="space-y-1 overflow-y-auto">
          {analyses.slice(0, 3).map((analysis) => (
            <li key={analysis._id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60"
              >
                <p className="truncate font-medium">{analysis.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
          <Avatar size="default">
            <AvatarFallback>JC</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Jayant Chaudhary</p>
            <p className="truncate text-xs text-muted-foreground">
              jayant@quicktake.app
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <Settings className="size-4" />
            <span className="sr-only">Account settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardContent className="py-2 px-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <h3 className="text-4xl font-bold tracking-tight">
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const isProcessing = status === "Processing";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        isProcessing
          ? "bg-amber-500/15 text-amber-400"
          : "bg-emerald-500/15 text-emerald-400"
      )}
    >
      {status}
    </span>
  );
}

export default DashboardPage;
