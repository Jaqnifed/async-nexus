"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/upload", label: "Upload" },
  { href: "/notes", label: "Notes" },
  { href: "/ask", label: "Ask" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-8 sm:py-5">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold text-on-accent">
          D
        </div>

        <div className="hidden sm:block">
          <h1 className="font-semibold tracking-tight">
            DecisionVault
          </h1>

          <p className="text-xs text-gray-500">
            Organizational Memory
          </p>
        </div>
      </Link>

      {/* Shortcuts */}
      <div className="flex items-center gap-1 sm:gap-2">
        {LINKS.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm sm:px-4 ${
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <ThemeToggle />
      </div>
    </nav>
  );
}
