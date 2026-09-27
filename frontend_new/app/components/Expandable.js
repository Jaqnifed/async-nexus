"use client";

import { useEffect, useRef, useState } from "react";

const CLAMP = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" };

// A paragraph that shows only the first few lines, with "Show more"
export default function Expandable({ text, lines = 3, className = "" }) {
  const [open, setOpen] = useState(false);
  const [cutOff, setCutOff] = useState(false);
  const ref = useRef(null);

  // Only offer "Show more" when the text really is cut off.
  // Re-checks when the window is resized.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setCutOff(el.scrollHeight > el.clientHeight + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => observer.disconnect();
  }, [text]);

  if (!text) return null;

  return (
    <div>
      <p
        ref={ref}
        className={`whitespace-pre-wrap ${className} ${open ? "" : CLAMP[lines]}`}
      >
        {text}
      </p>

      {(cutOff || open) && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mt-1.5 text-xs font-medium text-violet-400 hover:underline"
        >
          {open ? "Show less ▴" : "Show more ▾"}
        </button>
      )}
    </div>
  );
}
