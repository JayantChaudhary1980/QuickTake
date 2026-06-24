import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { askAnalysis } from "@/services/api";
import { cn } from "@/lib/utils";

const SUGGESTION_CHIPS = [
  "Explain the main idea in simple terms",
  "Create revision notes from this",
  "Quiz me on this topic",
];

export function AnalysisCopilot({ analysisId }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleAsk = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !analysisId) return;

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const { answer } = await askAnalysis(analysisId, trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleAsk(question);
  };

  return (
    <Card className="flex h-full flex-col border border-border/80 bg-card shadow-sm overflow-hidden">
      <CardHeader className="shrink-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-violet-600 dark:text-violet-400" />
          Ask QuickTake
        </CardTitle>
        <CardDescription>
          Ask questions about this analysis transcript
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && !isLoading && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ask questions about this analysis.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAsk(suggestion)}
                    className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-left text-xs transition-colors hover:border-violet-500/40 hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex w-full mb-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted/30 text-foreground"
                )}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                          p: ({ children }) => <p className="text-sm leading-relaxed mb-1">{children}</p>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast.success("Copied to clipboard");
                      }}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="size-3" />
                      Copy
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                QuickTake is thinking...
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="shrink-0 border-t border-border p-4">
        <form onSubmit={onSubmit} className="flex w-full gap-2">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleAsk(question);
              }
            }}
            placeholder="Ask about this analysis..."
            rows={2}
            disabled={isLoading}
            className={cn(
              "min-h-0 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            )}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 self-end"
            disabled={!question.trim() || isLoading}
            aria-label="Ask"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}