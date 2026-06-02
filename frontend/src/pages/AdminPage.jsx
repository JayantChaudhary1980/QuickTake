import React, { useEffect, useState } from "react";
import {
  Users,
  FileText,
  Clock,
  Activity,
  LayoutDashboard,
  Settings,
  User,
  Database,
  PieChart as PieIcon,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import jsPDF from "jspdf";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getAdminDashboard } from "@/services/api";
import { PieChart as RechPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Admin dashboard live data will populate stats below

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const overviewRef = React.useRef(null);
  const usersRef = React.useRef(null);
  const analysesRef = React.useRef(null);
  const mainRef = React.useRef(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleExport = async () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const marginLeft = 40;
      let y = 60;

      doc.setFontSize(18);
      doc.text("ADMIN DASHBOARD REPORT", marginLeft, y);
      y += 22;

      doc.setFontSize(10);
      doc.text(`Generated At: ${new Date().toLocaleString()}`, marginLeft, y);
      y += 18;

      const addSection = (title) => {
        doc.setFontSize(12);
        doc.text(title, marginLeft, y);
        y += 16;
      };

      const addKeyValue = (k, v) => {
        doc.setFontSize(10);
        doc.text(`${k}: ${v}`, marginLeft + 10, y);
        y += 14;
      };

      // Platform Metrics
      addSection("Platform Metrics");
      addKeyValue("Total Users", dashboard?.totalUsers ?? 0);
      addKeyValue("Users With Analyses", dashboard?.usersWithAnalyses ?? 0);
      addKeyValue("Total Analyses", dashboard?.totalAnalyses ?? 0);
      addKeyValue("Minutes Processed", dashboard?.totalMinutesProcessed ?? 0);
      y += 6;

      addSection("API Usage");
      addKeyValue("API Requests Total", dashboard?.apiRequestsTotal ?? 0);
      addKeyValue("API Requests Today", dashboard?.apiRequestsToday ?? 0);
      addKeyValue("Total Tokens Used", dashboard?.totalTokensUsed ?? 0);
      addKeyValue("Failed Requests", dashboard?.failedApiRequests ?? 0);
      const successRate = Math.round(((dashboard?.successfulApiRequests || 0) / Math.max(1, (dashboard?.apiRequestsTotal || 0))) * 100);
      addKeyValue("Success Rate", `${successRate}%`);
      y += 6;

      addSection("Analysis Distribution");
      addKeyValue("Upload Analyses", dashboard?.uploadCount ?? 0);
      addKeyValue("YouTube Analyses", dashboard?.youtubeCount ?? 0);
      addKeyValue("Live Capture Analyses", dashboard?.liveCaptureCount ?? 0);
      y += 6;

      // Recent Users table-like
      addSection("Recent Users");
      doc.setFontSize(10);
      y += 4;
      const users = dashboard?.recentUsers || [];
      // header
      doc.setFontSize(10);
      doc.text("Name", marginLeft + 10, y);
      doc.text("Email", marginLeft + 200, y);
      doc.text("Role", marginLeft + 380, y);
      doc.text("Joined", marginLeft + 470, y);
      y += 12;
      users.forEach((u) => {
        if (y > 720) { doc.addPage(); y = 60; }
        doc.text(u.name || "-", marginLeft + 10, y);
        doc.text(u.email || "-", marginLeft + 200, y);
        doc.text(u.role || "-", marginLeft + 380, y);
        doc.text(new Date(u.createdAt).toLocaleDateString() || "-", marginLeft + 470, y);
        y += 12;
      });
      y += 6;

      // Recent Analyses
      addSection("Recent Analyses");
      y += 4;
      const analyses = dashboard?.recentAnalyses || [];
      doc.text("Title", marginLeft + 10, y);
      doc.text("User", marginLeft + 220, y);
      doc.text("Type", marginLeft + 340, y);
      doc.text("Duration", marginLeft + 410, y);
      doc.text("Status", marginLeft + 470, y);
      doc.text("Date", marginLeft + 530, y);
      y += 12;
      analyses.forEach((a) => {
        if (y > 720) { doc.addPage(); y = 60; }
        doc.text(a.title || "-", marginLeft + 10, y);
        doc.text(a.userName || "-", marginLeft + 220, y);
        doc.text(a.sourceType || "-", marginLeft + 340, y);
        doc.text(formatDuration(a.durationSeconds || 0), marginLeft + 410, y);
        doc.text(a.status || "-", marginLeft + 470, y);
        doc.text(new Date(a.createdAt).toLocaleDateString() || "-", marginLeft + 530, y);
        y += 12;
      });

      const now = new Date();
      const fname = `QuickTake_Admin_Report_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.pdf`;
      doc.save(fname);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  // scroll helpers using IntersectionObserver
  const scrollToSection = (ref, section) => {
    setActiveSection(section);
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        if (visible.target === overviewRef.current) setActiveSection("overview");
        if (visible.target === usersRef.current) setActiveSection("users");
        if (visible.target === analysesRef.current) setActiveSection("analyses");
      },
      { root: container, threshold: 0.3 }
    );

    if (overviewRef.current) observer.observe(overviewRef.current);
    if (usersRef.current) observer.observe(usersRef.current);
    if (analysesRef.current) observer.observe(analysesRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 py-5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">QuickTake</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1 px-3">
            <button
              className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium ${activeSection === "overview" ? "bg-muted/40" : ""}`}
              onClick={() => scrollToSection(overviewRef, "overview")}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="size-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium ${activeSection === "users" ? "bg-muted/40" : ""}`}
              onClick={() => scrollToSection(usersRef, "users")}
            >
              <div className="flex items-center gap-3">
                <Users className="size-4" />
                <span>Users</span>
              </div>
            </button>

            <button
              className={`w-full text-left rounded-md px-3 py-2 text-sm font-medium ${activeSection === "analyses" ? "bg-muted/40" : ""}`}
              onClick={() => scrollToSection(analysesRef, "analyses")}
            >
              <div className="flex items-center gap-3">
                <FileText className="size-4" />
                <span>Analyses</span>
              </div>
            </button>

            <button
              disabled
              className="w-full text-left rounded-md px-3 py-2 text-sm font-medium opacity-50"
            >
              <div className="flex items-center gap-3">
                <Settings className="size-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>

          <div className="mt-auto border-t border-border/60 p-3">
            <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
              <Avatar size="default">
                <AvatarFallback>JC</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">Admin</p>
                <p className="truncate text-xs text-muted-foreground">admin@quicktake.app</p>
              </div>
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                <Settings className="size-4" />
                <span className="sr-only">Account settings</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-20 items-center gap-3 border-b border-border/60 px-6 md:px-10">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">Platform overview and activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => handleExport()}>
              Export
            </Button>
            <ModeToggle />
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Top metrics row */}
            <section ref={overviewRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-border/60 bg-card/40 animate-pulse">
                    <CardContent className="flex items-center gap-4 py-6 px-5">
                      <div className="h-12 w-12 rounded bg-muted/30" />
                      <div className="w-full">
                        <div className="h-4 w-1/3 rounded bg-muted/30" />
                        <div className="mt-3 h-8 w-2/3 rounded bg-muted/30" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : error ? (
                <Card className="border-border/60 bg-card/40 col-span-4">
                  <CardContent className="py-6 px-5 text-center">
                    <p className="text-sm text-muted-foreground">Failed to load dashboard</p>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                    <div className="mt-4">
                      <Button onClick={load}>Retry</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-border/60 bg-card/40 hover:shadow-md transition-transform hover:-translate-y-0.5">
                    <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <h3 className="mt-2 text-3xl font-extrabold">{dashboard?.totalUsers ?? 0}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="rounded-full bg-emerald-600 p-3 text-white shadow-sm">
                          <Users className="size-5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/40 hover:shadow-md transition-transform hover:-translate-y-0.5">
                    <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Users With Analyses</p>
                        <h3 className="mt-2 text-3xl font-extrabold">{dashboard?.usersWithAnalyses ?? 0}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="rounded-full bg-blue-600 p-3 text-white shadow-sm">
                          <UserCheck className="size-5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/40 hover:shadow-md transition-transform hover:-translate-y-0.5">
                    <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Analyses</p>
                        <h3 className="mt-2 text-3xl font-extrabold">{dashboard?.totalAnalyses ?? 0}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="rounded-full bg-violet-600 p-3 text-white shadow-sm">
                          <FileText className="size-5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/40 hover:shadow-md transition-transform hover:-translate-y-0.5">
                    <CardContent className="flex items-center justify-between gap-4 py-4 px-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Minutes Processed</p>
                        <h3 className="mt-2 text-3xl font-extrabold">{dashboard?.totalMinutesProcessed ?? 0}</h3>
                      </div>
                      <div className="flex items-center">
                        <span className="rounded-full bg-orange-500 p-3 text-white shadow-sm">
                          <Clock className="size-5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </section>

            {/* Usage + Quick Insights */}
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border/60 bg-card/40">
                  <CardHeader>
                    <CardTitle>Analysis Distribution</CardTitle>
                    <CardDescription>Breakdown by source type</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-6 items-center">
                      <div style={{ width: 220, height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RechPieChart>
                            <Pie
                              data={[
                                { name: "Upload", value: dashboard?.uploadCount || 0 },
                                { name: "YouTube", value: dashboard?.youtubeCount || 0 },
                                { name: "Live Capture", value: dashboard?.liveCaptureCount || 0 },
                              ]}
                              innerRadius={40}
                              outerRadius={70}
                              dataKey="value"
                              paddingAngle={4}
                            >
                              <Cell key="cell-0" fill="#8B5CF6" />
                              <Cell key="cell-1" fill="#3B82F6" />
                              <Cell key="cell-2" fill="#10B981" />
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Count"]} />
                          </RechPieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full" style={{ background: "#8B5CF6" }} />
                              <span className="text-sm text-muted-foreground">Upload</span>
                            </div>
                            <div className="font-medium">{dashboard?.uploadCount ?? 0}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full" style={{ background: "#3B82F6" }} />
                              <span className="text-sm text-muted-foreground">YouTube</span>
                            </div>
                            <div className="font-medium">{dashboard?.youtubeCount ?? 0}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full" style={{ background: "#10B981" }} />
                              <span className="text-sm text-muted-foreground">Live Capture</span>
                            </div>
                            <div className="font-medium">{dashboard?.liveCaptureCount ?? 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/40">
                  <CardHeader>
                    <CardTitle>Real-Time System Status</CardTitle>
                    <CardDescription>Quick health snapshot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md border border-border/40 bg-card/30 p-3">
                        <p className="text-sm text-muted-foreground">Backend Status</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded-full bg-emerald-600/20 text-emerald-400 px-2 py-0.5 text-xs">Healthy</span>
                        </div>
                      </div>
                      <div className="rounded-md border border-border/40 bg-card/30 p-3">
                        <p className="text-sm text-muted-foreground">API Usage Today</p>
                        <h4 className="mt-2 text-xl font-semibold">{dashboard?.apiRequestsToday ?? 0}</h4>
                      </div>
                      <div className="rounded-md border border-border/40 bg-card/30 p-3">
                        <p className="text-sm text-muted-foreground">Most Used Analysis Type</p>
                        <h4 className="mt-2 text-xl font-semibold">{dashboard?.mostUsedAnalysisType ?? "-"}</h4>
                      </div>
                      <div className="rounded-md border border-border/40 bg-card/30 p-3">
                        <p className="text-sm text-muted-foreground">Current Database Records</p>
                        <h4 className="mt-2 text-xl font-semibold">{dashboard?.totalAnalyses ?? 0}</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside>
                <Card className="border-border/60 bg-card/40">
                  <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                    <CardDescription>Key platform signals</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border border-border/40 bg-card/30 p-3 animate-pulse">
                          <div className="w-3/4">
                            <div className="h-4 w-1/2 rounded bg-muted/30" />
                            <div className="mt-2 h-5 w-2/3 rounded bg-muted/20" />
                          </div>
                          <div className="w-8 h-8 rounded bg-muted/30" />
                        </div>
                      ))
                    ) : (
                      [
                        { id: "apiTotal", icon: Activity, label: "API Requests Total", value: dashboard?.apiRequestsTotal ?? 0, color: "text-sky-400" },
                        { id: "tokens", icon: PieIcon, label: "Total Tokens Used", value: dashboard?.totalTokensUsed ?? 0, color: "text-violet-400" },
                        { id: "failed", icon: AlertCircle, label: "Failed Requests", value: dashboard?.failedApiRequests ?? 0, color: "text-red-400" },
                        { id: "success", icon: CheckCircle, label: "Success Rate", value: `${Math.round(((dashboard?.successfulApiRequests || 0) / Math.max(1, (dashboard?.apiRequestsTotal || 0))) * 100)}%`, color: "text-emerald-400" },
                      ].map((q) => (
                        <div key={q.id} className="flex items-center justify-between rounded-md border border-border/40 bg-card/30 p-3">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full p-2 ${q.color} bg-white/5`}> <q.icon className="size-4" /> </span>
                            <div>
                              <p className="text-sm text-muted-foreground">{q.label}</p>
                              <h4 className="mt-1 text-lg font-semibold">{q.value}</h4>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </aside>
            </section>

            {/* Recent Users */}
            <section>
              <div ref={usersRef}>
                <Card className="border-border/60 bg-card/40">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest signups</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr] border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Joined</div>
                  </div>
                  <div className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-3 px-6 py-3">
                          <div className="h-4 w-3/4 rounded bg-muted/30" />
                          <div className="h-4 w-3/4 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                        </div>
                      ))
                    ) : (
                      (dashboard?.recentUsers || []).map((u, idx) => {
                        const initials = (u.name || "").split(" ").map(s => s[0]).slice(0,2).join("");
                        return (
                          <div key={u._id || idx} className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-3 px-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar size="sm"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                              <div className="font-medium">{u.name}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                            <div>
                              <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-muted/20">{u.role}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            </section>

            {/* Recent Analyses */}
            <section>
              <div ref={analysesRef}>
                <Card className="border-border/60 bg-card/40">
                <CardHeader>
                  <CardTitle>Recent Analyses</CardTitle>
                  <CardDescription>Latest processed analyses</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-border px-6 py-3 text-sm font-medium text-muted-foreground">
                    <div>Title</div>
                    <div>User</div>
                    <div>Type</div>
                    <div>Duration</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>
                  <div className="divide-y divide-border">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-3 px-6 py-3">
                          <div className="h-4 w-3/4 rounded bg-muted/30" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                          <div className="h-4 w-1/2 rounded bg-muted/20" />
                        </div>
                      ))
                    ) : (
                      (dashboard?.recentAnalyses || []).map((a, idx) => {
                        const typeColor = a.sourceType === "UPLOAD" ? "bg-violet-600/10 text-violet-300" : a.sourceType === "YOUTUBE" ? "bg-sky-600/10 text-sky-300" : "bg-emerald-600/10 text-emerald-300";
                        return (
                          <div key={a._id || idx} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] items-center gap-3 px-6 py-3 hover:bg-muted/30">
                            <div className="font-medium">{a.title}</div>
                            <div className="text-sm text-muted-foreground">{a.userName || "-"}</div>
                            <div>
                              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}>{a.sourceType}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">{formatDuration(a.durationSeconds || 0)}</div>
                            <div>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                                {a.status === "COMPLETED" ? "Completed" : "Processing"}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}