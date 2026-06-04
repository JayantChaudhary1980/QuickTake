import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Bot,
  FileText,
  LayoutDashboard,
  Monitor,
  Sparkles,
  PlayCircle,
  Video,
  Phone,
  Mail,
  Check,
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const PORTFOLIO_URL = "https://your-portfolio-link.com";

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
            {/* <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Login</Link>
            </Button> */}
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                fetch("http://localhost:8000/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ credential: credentialResponse.credential }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                  })
                  .catch((e) => console.error(e));
              }}
              onError={() => console.log("Login Failed")}
            />
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-3.5 text-violet-400" />
              AI-powered meeting intelligence
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Every meeting,{" "}
              <span className="bg-linear-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
                understood
              </span>
            </h1>

            <p className="mt-4 text-base text-muted-foreground text-pretty md:text-lg">
              QuickTake analyzes video, screens, and conversations—then delivers
              summaries, chat, and insights your team can act on immediately.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="shadow-sm hover:shadow-md transition">
                <Link to="/dashboard" className="flex items-center gap-3">
                  Start for free
                  <LayoutDashboard className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:bg-muted/10">
                <a href="#features">See how it works</a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Works with Zoom, Meet, and uploads
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-violet-600/10 p-2 text-violet-400">
                  <FileText className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">11+ Analyses Processed</div>
                  <div className="text-xs text-muted-foreground">Real usage examples</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-sky-600/10 p-2 text-sky-400">
                  <PlayCircle className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">3 Analysis Sources</div>
                  <div className="text-xs text-muted-foreground">Upload, YouTube, Live</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-emerald-600/10 p-2 text-emerald-400">
                  <Bot className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">AI Powered Summaries</div>
                  <div className="text-xs text-muted-foreground">Concise, shareable notes</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mx-auto mt-12 max-w-4xl border-border/60 bg-card/50 shadow-2xl shadow-violet-500/5 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <span className="size-2.5 rounded-full bg-red-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-muted-foreground">live-meeting-analysis.session</span>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Key Discussion Points
                    </p>

                    <p className="text-sm leading-relaxed">
                        <span className="text-violet-400 font-medium">Roadmap:</span>{" "}
                        Align on Q2 priorities before allocating resources.
                    </p>

                    <p className="text-sm leading-relaxed">
                        <span className="text-sky-400 font-medium">Demo:</span>{" "}
                        Review onboarding flow demonstrated during screen sharing.
                    </p>

                    <p className="text-sm leading-relaxed">
                        <span className="text-emerald-400 font-medium">Next Steps:</span>{" "}
                        Assign ownership and schedule implementation follow-ups.
                    </p>
                    </div>
                <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Meeting Highlights
                </p>

                <div className="border-l-2 border-violet-500 pl-3">
                    <p className="text-sm font-medium">Q2 Planning</p>
                    <p className="text-sm text-muted-foreground">
                    Resource allocation and roadmap discussion.
                    </p>
                </div>

                <div className="border-l-2 border-sky-500 pl-3">
                    <p className="text-sm font-medium">Onboarding Demo</p>
                    <p className="text-sm text-muted-foreground">
                    Screen-shared walkthrough reviewed by the team.
                    </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-3">
                    <p className="text-sm font-medium">Action Items</p>
                    <p className="text-sm text-muted-foreground">
                    Ownership assigned and follow-up scheduled.
                    </p>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Small stats */}
        <section id="stats-small" className="mx-auto max-w-6xl px-6 py-10">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-lg font-medium">Trusted by teams for faster outcomes</h3>
            <p className="mt-2 text-sm text-muted-foreground">Actionable insights from meetings, recordings, and calls.</p>
          </div>

          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-violet-600/10 p-2 text-violet-400">
                  <Bot className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">AI Powered Analysis</div>
                  <div className="text-xs text-muted-foreground">Automatic insights from every meeting</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-sky-600/10 p-2 text-sky-400">
                  <PlayCircle className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">Multiple Input Sources</div>
                  <div className="text-xs text-muted-foreground">Upload, YouTube links, and live meetings</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50">
              <CardContent className="flex items-center gap-3">
                <span className="rounded-md bg-emerald-600/10 p-2 text-emerald-400">
                  <FileText className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">Instant Meeting Summaries</div>
                  <div className="text-xs text-muted-foreground">Concise, shareable notes</div>
                </div>
              </CardContent>
            </Card>
          </div>
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
        <section id="cta" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
            <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center py-12 text-center">

                <div className="mb-5 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1 text-sm font-medium text-violet-300">
                Free • No Subscription • No Limits
                </div>

                <h2 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">
                Enterprise-Level Meeting Intelligence
                <span className="mt-2 block text-violet-400">
                    Without Enterprise Pricing
                </span>
                </h2>

                <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
                Get AI summaries, transcript chat, YouTube analysis, and meeting
                intelligence features typically locked behind expensive monthly
                subscriptions.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">

                <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span className="text-emerald-400">✓</span>
                    Unlimited Analysis
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span className="text-emerald-400">✓</span>
                    AI Summaries
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span className="text-emerald-400">✓</span>
                    Transcript Chat
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                    <span className="text-emerald-400">✓</span>
                    YouTube Analysis
                </div>
                </div>

                <Button size="lg" className="mt-10" asChild>
                <Link to="/dashboard">
                    Start Analyzing Meetings
                </Link>
                </Button>

                <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • No subscription fees • Start instantly
                </p>

            </CardContent>
            </Card>
        </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/50 py-12">
    <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
            <h4 className="text-lg font-semibold">QuickTake</h4>
            <p className="mt-2 text-sm text-muted-foreground">
            AI-powered meeting intelligence platform for recordings,
            meetings, live discussions, and YouTube content.
            </p>
        </div>

        <div>
            <h5 className="text-sm font-semibold">Product</h5>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
                <a href="#features" className="hover:text-foreground">
                Features
                </a>
            </li>
            <li>
                <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
                </Link>
            </li>
            </ul>
        </div>

        <div>
            <h5 className="text-sm font-semibold">Contact</h5>

            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>+91 6375881436</span>
            </li>

            <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <a
                href="mailto:jayant.chaudhary1980@gmail.com"
                className="hover:text-foreground"
                >
                jayant.chaudhary1980@gmail.com
                </a>
            </li>
            </ul>
        </div>

        <div>
            <h5 className="text-sm font-semibold">Developer</h5>

            <div className="mt-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
                Jayant Chaudhary
            </p>

            
            <p>VIT Bhopal University</p>
            </div>
        </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QuickTake. Built by <span className="font-bold text-violet-400">Jayant Chaudhary</span>.
        </p>

        <div className="flex items-center gap-5">
            {/* Portfolio */}
            <a
                href="https://personal-portfolio-nine-nu-61.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="group mt-3 flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 transition-all duration-300 hover:border-violet-400 hover:bg-violet-500/15 hover:shadow-lg hover:shadow-violet-500/10"
                >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-500/20 text-violet-400">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    >
                    <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" />
                    <path d="M15 3H21V9" />
                    <path d="M10 14L21 3" />
                    </svg>
                </div>

                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                    Visit my Portfolio
                    </p>
                    <p className="text-xs text-muted-foreground">
                    Projects & Experience
                    </p>
                </div>
                </a>

            {/* GitHub */}
            <a
                href="https://github.com/JayantChaudhary1980"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground transition-colors hover:text-foreground"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                >
                <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.35 22.95c.6.1.82-.26.82-.58v-2.2c-3.18.69-3.85-1.35-3.85-1.35-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.54-.29-5.22-1.27-5.22-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.17a10.98 10.98 0 0 1 5.8 0c2.21-1.48 3.18-1.17 3.18-1.17.62 1.59.23 2.77.11 3.06.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .32.21.69.83.58A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>
                </svg>
            </a>

            {/* LinkedIn */}
            <a
                href="https://www.linkedin.com/in/jayantchaudhary2004/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-sky-400"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.5 8h4V24h-4V8zm7 0h3.84v2.18h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.86 2.7 4.86 6.21V24h-4v-7.69c0-1.84-.03-4.21-2.57-4.21-2.58 0-2.97 2.01-2.97 4.08V24h-4V8z"/>
                </svg>
            </a>
            </div>
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