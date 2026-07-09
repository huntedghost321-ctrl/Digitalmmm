"use client";

import { useState } from "react";

export function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        className="flex-1 rounded border border-ink/15 bg-white px-3 py-2 font-mono text-sm"
        aria-label="Your referral link"
      />
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded bg-teal px-4 py-2 text-sm font-medium text-paper hover:bg-teal-dark"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
