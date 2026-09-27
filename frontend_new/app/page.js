"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b12] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-5">

        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-lg">
            D
          </div>

          <div>
            <h1 className="font-semibold tracking-tight">
              DecisionVault
            </h1>

            <p className="text-xs text-gray-500">
              Organizational Memory
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">

          <Link
            href="/upload"
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            Documents
          </Link>

          <Link
            href="/ask"
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            Ask DecisionVault
          </Link>

          <Link
            href="/decisions"
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            Decisions
          </Link>

        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">

        <div className="max-w-3xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            DECISION INTELLIGENCE
          </div>

          <h2 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Your organization's
            <span className="block text-violet-400">
              memory, made searchable.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            DecisionVault turns meeting notes and project documents into
            structured organizational memory — capturing decisions,
            reasons, owners, alternatives and context.
          </p>

          {/* Main actions */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/upload"
              className="rounded-xl bg-violet-600 px-7 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500"
            >
              Upload a Document
            </Link>

            <Link
              href="/ask"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              Ask DecisionVault
            </Link>

          </div>

        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 text-xl">
              ↑
            </div>

            <p className="text-xs text-gray-500">
              01
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Upload
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Upload meeting notes, project documents and decision records.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 text-xl">
              ✦
            </div>

            <p className="text-xs text-gray-500">
              02
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Understand
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              AI extracts decisions, reasons, owners, status and alternatives.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 text-xl">
              ?
            </div>

            <p className="text-xs text-gray-500">
              03
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Ask
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Ask why decisions were made and retrieve the context behind them.
            </p>
          </div>

        </div>

        {/* Example */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8">

          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
            Example
          </p>

          <div className="mt-6 grid gap-8 md:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Ask
              </p>

              <p className="mt-2 text-xl font-medium">
                “Why did we choose AWS?”
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                DecisionVault
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                The team selected AWS because of existing team experience
                and lower estimated first-year infrastructure costs.
              </p>
            </div>

          </div>

        </div>

      </section>
    </main>
  );
}