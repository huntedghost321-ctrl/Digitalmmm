"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Cookie consent (MVP item 12). MVP sets no non-essential cookies; the banner
// records the choice so analytics added later respect it.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dmm-cookie-choice")) setVisible(true);
  }, []);

  const choose = (choice: "essential" | "all") => {
    localStorage.setItem("dmm-cookie-choice", choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-paper p-4 shadow-[0_-4px_24px_rgba(27,34,44,0.08)]">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-ink/80">
          We use essential cookies to keep you signed in. Nothing else runs until you say so.{" "}
          <Link href="/legal/privacy" className="underline decoration-teal underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => choose("essential")}
            className="rounded border border-ink/20 px-4 py-2 text-sm font-medium hover:bg-ink/5"
          >
            Essential only
          </button>
          <button
            onClick={() => choose("all")}
            className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
