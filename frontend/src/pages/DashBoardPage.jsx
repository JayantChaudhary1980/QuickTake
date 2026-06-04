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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NewAnalysisDialog } from "@/components/new-analysis-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  { id: "history", label: "History", icon: History },
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
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const [activeNav, setActiveNav] = useState(
    localStorage.getItem("activeNav") || "dashboard"
  );
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
    localStorage.setItem("activeNav", activeNav);
  }, [activeNav]);

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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <NewAnalysisDialog
        open={newAnalysisOpen}
        onOpenChange={setNewAnalysisOpen}
      />

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
        <SidebarContent
          analyses={analyses}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onNewAnalysis={() => setNewAnalysisOpen(true)}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
            <h1 className="text-4xl font-bold tracking-tight">
              {activeNav === "history" ? "History" : "Dashboard"}
            </h1>

            <p className="text-muted-foreground">
              {activeNav === "history"
                ? "Browse all your previous analyses"
                : "Manage analyses and review insights"}
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {activeNav === "history" ? (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-3 py-1 text-sm text-muted-foreground">
                        Showing {filteredAnalyses.length} analyses
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 w-80 rounded-md border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                {filteredAnalyses.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">No analyses found.</CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b border-border px-6 py-4 text-sm font-medium text-muted-foreground">
                        <div>Title</div>
                        <div>Type</div>
                        <div>Status</div>
                        <div>Date</div>
                        <div>Time</div>
                        <div>Duration</div>
                      </div>

                      {filteredAnalyses.map((analysis) => {
                        const createdDate = new Date(analysis.createdAt);
                        return (
                          <Link
                            key={analysis._id}
                            to={`/analysis/${analysis._id}`}
                            className="group block"
                          >
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center border-b border-border/40 px-6 py-4 transition-colors hover:bg-muted/40">
                              <div className="truncate font-medium transition-colors group-hover:text-violet-400">{analysis.title}</div>
                              <div className="text-muted-foreground">
                                {analysis.sourceType === "YOUTUBE"
                                  ? "YouTube"
                                  : analysis.sourceType === "LIVE_CAPTURE"
                                  ? "Live Capture"
                                  : "Upload"}
                              </div>
                              <div>
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${analysis.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                                  {analysis.status === "COMPLETED" ? "Complete" : "Processing"}
                                </span>
                              </div>
                              <div className="text-muted-foreground">{createdDate.toLocaleDateString()}</div>
                              <div className="text-muted-foreground">{createdDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                              <div className="text-muted-foreground">{formatDuration(analysis.durationSeconds || 0)}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // Default Dashboard View (unchanged)
              <>
                {backendOk && (
                  <p className="text-sm font-medium text-emerald-500">Backend Status: OK</p>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Total analyses" value={stats.totalAnalyses} />
                  <StatCard label="This week" value={stats.thisWeek} />
                  <StatCard label="Hours saved" value={displayTime || 0} />
                </div>

                <section>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Recent Analyses</h2>
                      <p className="text-sm text-muted-foreground">Pick up where you left off or start something new</p>
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

                      <Button className="hidden sm:inline-flex" onClick={() => setNewAnalysisOpen(true)}>
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
                        <Link key={analysis._id} to={`/analysis/${analysis._id}`} className="block">
                          <Card className="h-full cursor-pointer border-border/60 transition-colors hover:border-violet-500/30 hover:bg-card">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base">{analysis.title}</CardTitle>
                                <StatusBadge status={analysis.status === "COMPLETED" ? "Complete" : "Processing"} />
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
                    <button onClick={() => setActiveNav("history")} className="text-sm font-medium text-white transition-colors hover:text-violet-400">View all analyses →</button>
                  </div>
                </section>
              </>
            )}
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
    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Unknown";

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
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 font-normal",
                  isActive && "bg-secondary"
                )}
                onClick={() => onNavChange(item.id)}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
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

      <div className="px-3 space-y-3">
        <p className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          WORKSPACE
        </p>

        <div className="rounded-lg border border-border/40 p-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="text-sm font-medium">Free</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 p-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{user?.role || "User"}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 p-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">{memberSince}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/40 p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
          <Avatar size="default">
            <AvatarImage
              src={user.picture || user.image || user.avatar}
              alt={user.name}
            />

            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{(() => { try { const u = JSON.parse(localStorage.getItem("user")||"null"); return (u && u.name) || "User"; } catch(e){ return "User" } })()}</p>
            <p className="truncate text-xs text-muted-foreground">{(() => { try { const u = JSON.parse(localStorage.getItem("user")||"null"); return (u && u.email) || ""; } catch(e){ return "" } })()}</p>
          </div>
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-muted/40 border-border/60 hover:bg-muted"
                >
                  <Settings className="size-4" />
                  <span className="sr-only">Account settings</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-auto min-w-0 p-1">
                {/* <DropdownMenuItem onSelect={() => (window.location.href = "/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => (window.location.href = "/account")}>Account</DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="cursor-pointer text-red-400 font-medium data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-400"
                  >
                    Logout
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
