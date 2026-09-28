"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Expandable from "../components/Expandable";

const API_URL = "/api";

// Pick a badge colour from the status text
function statusStyle(status = "") {
  const s = status.toLowerCase();
  if (s.includes("reject")) return "border-red-500/20 bg-red-500/10 text-red-300";
  if (s.includes("pending")) return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  if (s.includes("postpone") || s.includes("deferred")) return "border-white/10 bg-white/5 text-gray-300";
  if (s.includes("approve") || s.includes("accept") || s.includes("final"))
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  return "border-violet-500/20 bg-violet-500/10 text-violet-300";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date)) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// One labelled list (alternatives, risks, ...). Hidden when empty.
function Section({ title, items, accent }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-4">
      <p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-6 text-gray-300">
            <span className="text-gray-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionCard({ d }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {d.topic ? (
          // Topic as the heading, the decision underneath
          <div>
            <h4 className="text-lg font-semibold leading-7 text-white">
              {d.topic}
            </h4>
            <p className="mt-1 text-[15px] leading-6 text-gray-300">
              <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                Decision:
              </span>
              {d.decision || "Untitled decision"}
            </p>
          </div>
        ) : (
          // Older notes saved before topics existed
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">
              Decision
            </p>
            <h4 className="mt-1 text-lg font-semibold leading-7 text-white">
              {d.decision || "Untitled decision"}
            </h4>
          </div>
        )}

        {d.status && (
          <span
            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle(d.status)}`}
          >
            {d.status}
          </span>
        )}
      </div>

      {d.owner && (
        <p className="mt-1 text-sm text-gray-500">
          Owner: <span className="text-gray-300">{d.owner}</span>
        </p>
      )}

      {/* Summary paragraph (older notes without a summary show the reason) */}
      <div className="mt-3">
        <Expandable
          text={d.summary || (d.reason ? `Why: ${d.reason}` : "")}
          lines={2}
          className="text-[13px] italic leading-6 text-gray-400"
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Section title="Alternatives considered" items={d.alternatives} accent="text-sky-300" />
        <Section title="Action items" items={d.action_items} accent="text-violet-300" />
        <Section title="Assumptions" items={d.assumptions} accent="text-amber-300" />
        <Section title="Risks" items={d.risks} accent="text-red-300" />
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDoc, setNewDoc] = useState("");

  useEffect(() => {
    // Which document was just uploaded? (from /notes?new=filename)
    const justUploaded =
      new URLSearchParams(window.location.search).get("new") || "";

    fetch(`${API_URL}/decisions`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load notes.");
        return res.json();
      })
      .then((data) => {
        setDecisions(data.decisions || []);
        setNewDoc(justUploaded);
      })
      .catch(() =>
        setError("Could not reach the backend. Is it running on port 8000?")
      )
      .finally(() => setLoading(false));
  }, []);

  // Scroll to the new document once it has loaded
  useEffect(() => {
    if (!loading && newDoc) {
      document.getElementById(`doc-${newDoc}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [loading, newDoc]);

  // Group decisions into one note per document, newest first
  const groups = {};
  for (const d of decisions) {
    const source = d.source || "Unknown document";
    if (!groups[source]) groups[source] = { source, addedAt: d.added_at, items: [] };
    groups[source].items.push(d);
  }
  const documents = Object.values(groups).sort((a, b) =>
    (b.addedAt || "").localeCompare(a.addedAt || "")
  );

  const pendingCount = decisions.filter((d) =>
    (d.status || "").toLowerCase().includes("pending")
  ).length;
  const riskCount = decisions.reduce((n, d) => n + (d.risks?.length || 0), 0);

  return (
    <main className="min-h-screen bg-page text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-200px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <Navbar />

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6">

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            DECISION MEMORY
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Notes
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
            Everything DecisionVault has learned, one note per document.
          </p>
        </div>

        {/* Summary numbers */}
        {!loading && !error && decisions.length > 0 && (
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Documents", documents.length],
              ["Decisions", decisions.length],
              ["Pending", pendingCount],
              ["Risks tracked", riskCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* States */}
        {loading && <p className="text-gray-500">Loading notes…</p>}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && decisions.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-lg font-semibold">No notes yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Upload a meeting or project PDF and its decisions will appear here.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-on-accent hover:bg-violet-500"
            >
              Upload a document
            </Link>
          </div>
        )}

        {/* One note per document */}
        <div className="space-y-8">
          {documents.map((doc) => {
            const isNew = doc.source === newDoc;

            return (
              <div
                key={doc.source}
                id={`doc-${doc.source}`}
                className={`scroll-mt-6 rounded-3xl border p-2 ${
                  isNew
                    ? "border-violet-500/40 bg-violet-500/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {/* Document header */}
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-sm text-red-400">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{doc.source}</p>
                      <p className="text-xs text-gray-500">
                        {doc.items.length} {doc.items.length === 1 ? "decision" : "decisions"}
                        {formatDate(doc.addedAt) && ` · added ${formatDate(doc.addedAt)}`}
                      </p>
                    </div>
                  </div>

                  {isNew && (
                    <span className="w-fit rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-on-accent">
                      Just uploaded
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {doc.items.map((d, i) => (
                    <DecisionCard key={i} d={d} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && !error && decisions.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/ask"
              className="inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              Ask a question about these notes →
            </Link>
          </div>
        )}

      </section>
    </main>
  );
}
