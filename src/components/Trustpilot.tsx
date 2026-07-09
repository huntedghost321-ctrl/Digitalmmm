"use client";

import { useEffect, useRef } from "react";

// Real third-party reviews (PRD 5.9). The official Trustpilot widget renders
// only when a business ID is configured — we never fake review data.
export function TrustpilotWidget() {
  const businessId = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID;
  const templateId = process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID ?? "5419b6a8b0d04a076446a9ad";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!businessId) return;
    const script = document.createElement("script");
    script.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [businessId]);

  if (!businessId) {
    return (
      <p className="font-mono text-sm text-ink/60">
        Trustpilot reviews will appear here once we have them — we only show real,
        third-party-verified reviews, never self-reported stats.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      className="trustpilot-widget"
      data-locale="en-US"
      data-template-id={templateId}
      data-businessunit-id={businessId}
      data-style-height="120px"
      data-style-width="100%"
    >
      <a href="https://www.trustpilot.com" target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
