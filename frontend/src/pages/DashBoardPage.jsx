import { useEffect, useState } from "react";
import {
  Clock,
  History,
  LayoutDashboard,
  Menu,
  Plus,
  Settings,
  Zap,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
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
import { getHealth } from "@/services/api";
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
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
        <SidebarContent
          activeNav={activeNav}
          onNavChange={setActiveNav}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border/60 px-4 md:px-6">
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
                activeNav={activeNav}
                onNavChange={(id) => {
                  setActiveNav(id);
                  setMobileOpen(false);
                }}
                className="h-full"
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {navItems.find((item) => item.id === activeNav)?.label ?? "Dashboard"}
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Manage analyses and review insights
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button className="md:hidden" size="sm">
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
              <StatCard label="Total analyses" value="24" />
              <StatCard label="This week" value="6" />
              <StatCard label="Hours saved" value="18h" />
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
                <Button className="hidden sm:inline-flex">
                  <Plus className="size-4" />
                  New Analysis
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {recentAnalyses.map((analysis) => (
                  <Card
                    key={analysis.id}
                    className="cursor-pointer border-border/60 transition-colors hover:border-violet-500/30 hover:bg-card"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{analysis.title}</CardTitle>
                        <StatusBadge status={analysis.status} />
                      </div>
                      <CardDescription>{analysis.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      {analysis.time}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ activeNav, onNavChange, className }) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2 px-4 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </span>
        <span className="text-lg font-semibold tracking-tight">QuickTake</span>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2" size="lg">
          <Plus className="size-4" />
          New Analysis
        </Button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

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
        })}
      </nav>

      <Separator className="my-4" />

      <div className="flex min-h-0 flex-1 flex-col px-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent
        </p>
        <ul className="space-y-1 overflow-y-auto">
          {recentAnalyses.slice(0, 3).map((analysis) => (
            <li key={analysis.id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60"
              >
                <p className="truncate font-medium">{analysis.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {analysis.time}
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
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
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
