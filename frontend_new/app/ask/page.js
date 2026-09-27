"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Expandable from "../components/Expandable";

const API_URL = "/api";

// Split the model's reply into: a one-line answer, the context paragraph,
// and the list of sources, e.g. "(Source: demo.pdf)"
function parseAnswer(text = "") {
  const sources = [];

  const withoutSources = text
    .replace(/\(\s*sources?\s*:\s*([^)]*)\)/gi, (_, list) => {
      list.split(/[,;]/).forEach((s) => {
        const name = s.trim();
        if (name && !sources.includes(name)) sources.push(name);
      });
      return "";
    })
    .trim();

  const parts = withoutSources.split(/\n\s*\n/);
  const headline = (parts[0] || "").trim();
  const details = parts.slice(1).join("\n\n").trim();

  return { headline, details, sources };
}

function Answer({ text }) {
  const { headline, details, sources } = parseAnswer(text);

  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="whitespace-pre-wrap text-[15px] font-medium leading-6 text-white">
        {headline}
      </p>

      {details && (
        <div className="mt-2">
          <Expandable
            text={details}
            lines={3}
            className="text-[13px] italic leading-6 text-gray-400"
          />
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Source:</span>
          {sources.map((s) => (
            <span
              key={s}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const EXAMPLES = [
  "What decisions are still pending?",
  "What risks did we accept?",
  "Why did we choose React?",
  "What are the action items and who owns them?",
];

export default function AskPage() {
  const [messages, setMessages] = useState([]);   // { role, content, error? }
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || thinking) return;

    // Earlier turns, so follow-ups like "Is it approved?" work
    const history = messages
      .filter((m) => !m.error)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setThinking(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });

      // If the backend is off, the reply is not JSON
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not reach the backend. Is it running on port 8000?"
        );
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message === "Failed to fetch"
              ? "Could not reach the backend. Is it running on port 8000?"
              : error.message,
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-page text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <Navbar />

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">

        {/* Heading (only before the first question) */}
        {messages.length === 0 && (
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              ASK YOUR MEMORY
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ask DecisionVault
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-gray-400">
              Ask why something was decided, who owns it, or what could go
              wrong. Every answer says which document it came from.
            </p>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => ask(ex)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-gray-300 hover:bg-white/[0.06]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 space-y-4">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-violet-600 text-on-accent px-4 py-3 text-sm leading-6">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                {m.error ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
                    {m.content}
                  </div>
                ) : (
                  <Answer text={m.content} />
                )}
              </div>
            )
          )}

          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-400">
                <span className="animate-pulse">Thinking with the local model…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="sticky bottom-4 mt-6 flex gap-2 rounded-2xl border border-white/10 bg-page/90 p-2 backdrop-blur-xl"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about any decision…"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder-gray-500 outline-none"
          />

          <button
            type="submit"
            disabled={!question.trim() || thinking}
            className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold ${
              !question.trim() || thinking
                ? "cursor-not-allowed bg-white/5 text-gray-600"
                : "bg-violet-600 text-on-accent hover:bg-violet-500"
            }`}
          >
            Ask
          </button>
        </form>

      </section>
    </main>
  );
}
