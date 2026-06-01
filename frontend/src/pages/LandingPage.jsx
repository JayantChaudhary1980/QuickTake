import { Link } from "react-router-dom";
import {
  Bot,
  FileText,
  LayoutDashboard,
  Monitor,
  Sparkles,
  PlayCircle,
  Video,
} from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Video Analysis",
    description:
      "Upload recordings or paste links. AI extracts speakers, topics, and key moments automatically.",
    icon: Video,
  },
  {
    title: "Meeting Summaries",
    description:
      "Get concise recaps with decisions, action items, and follow-ups—ready to share in seconds.",
    icon: FileText,
  },
  {
    title: "AI Chat",
    description:
      "Ask questions about any meeting. Search transcripts and get cited answers instantly.",
    icon: Bot,
  },
  {
    title: "Screen Understanding",
    description:
      "AI reads slides, demos, and shared screens so context from visuals is never lost.",
    icon: Monitor,
  },
  {
    title: "YouTube Analysis",
    description:
      "Drop a YouTube URL and turn long videos into structured notes and searchable insights.",
    icon: PlayCircle,
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/4%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/4%)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            QuickTake
          </Link>

          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#cta" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Login</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-3.5 text-violet-400" />
              AI-powered meeting intelligence
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Every meeting,{" "}
              <span className="bg-linear-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                understood
              </span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground text-pretty md:text-xl">
              QuickTake analyzes video, screens, and conversations—then delivers
              summaries, chat, and insights your team can act on immediately.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  Start for free
                  <LayoutDashboard className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See how it works</a>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · Works with Zoom, Meet, and uploads
            </p>
          </div>

          <Card className="mx-auto mt-16 max-w-4xl border-border/60 bg-card/50 shadow-2xl shadow-violet-500/5 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-muted-foreground">
                  live-meeting-analysis.session
                </span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Live transcript
                  </p>
                  <p className="text-sm leading-relaxed">
                    <span className="text-violet-400">Alex:</span> Let&apos;s align on
                    the Q2 roadmap before we commit resources.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <span className="text-sky-400">Jordan:</span> The demo on slide 12
                    shows the new onboarding flow.
                  </p>
                </div>
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    AI summary
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      Q2 roadmap review scheduled
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      Onboarding flow approved from screen share
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      3 action items assigned
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border/60 bg-muted/20 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Built for how teams actually meet
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                From live calls to recorded videos, QuickTake turns messy
                conversations into structured knowledge.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Card className="relative overflow-hidden border-violet-500/20 bg-linear-to-br from-violet-950/80 via-card to-card">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.55_0.2_280/25%),transparent_50%)]" />
              <CardHeader className="relative text-center">
                <CardTitle className="text-3xl font-semibold md:text-4xl">
                  Ready to never miss a meeting detail?
                </CardTitle>
                <CardDescription className="mx-auto mt-3 max-w-xl text-base">
                  Join teams using QuickTake to capture, search, and share
                  meeting intelligence—without manual note-taking.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative flex flex-col items-center gap-4 pb-10">
                <Button size="lg" asChild>
                  <Link to="/dashboard">Get started free</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Setup takes less than 2 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} QuickTake. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon }) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card/80 transition-colors",
        "hover:border-violet-500/30 hover:bg-card"
      )}
    >
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
          <Icon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default LandingPage;
