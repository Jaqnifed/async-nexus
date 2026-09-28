"use client";

// Switches between dark and light mode and remembers the choice.
// Which icon shows is decided by CSS (the "light" class on <html>),
// so the button never flickers when the page loads.
export default function ThemeToggle() {
  const toggle = () => {
    const isLight = document.documentElement.classList.toggle("light");
    try {
      localStorage.setItem("theme", isLight ? "light" : "dark");
    } catch {
      // Private browsing can block storage; the switch still works
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="Switch light / dark mode"
      aria-label="Switch light / dark mode"
      className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
    >
      {/* Sun: shown in dark mode (click for light) */}
      <svg className="h-4 w-4 light:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>

      {/* Moon: shown in light mode (click for dark) */}
      <svg className="hidden h-4 w-4 light:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
