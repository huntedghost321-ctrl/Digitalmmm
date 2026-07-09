"use client";

import { useEffect, useRef, useState } from "react";

// The signature element (PRD Section 4): a horizontal assembly line where messy
// raw material visibly becomes a finished product. Hand-drawn, slightly
// imperfect linework; one scroll-triggered reveal; no other motion on the page.
export function AssemblyLine() {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={live ? "assembly-live" : ""} aria-hidden>
      <svg viewBox="0 0 960 300" className="w-full" role="img" aria-label="A messy transcript moves along an assembly line and becomes a finished book">
        {/* Hand-drawn conveyor line — deliberately wobbly path */}
        <path
          className="assembly-path"
          d="M20 236 C 120 231, 180 240, 300 235 S 520 239, 640 234 S 880 238, 940 233"
          fill="none"
          stroke="#1B222C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="assembly-path"
          d="M24 244 C 140 241, 220 247, 340 243 S 560 246, 700 242 S 900 245, 936 241"
          fill="none"
          stroke="#8FA998"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ animationDelay: "0.15s" }}
        />

        <g className="assembly-stage">
          {/* Stage 1 — messy input: a crumpled transcript scrap */}
          <path
            d="M60 130 l88 -7 q6 40 -2 78 l-84 9 q-8 -41 -2 -80 z"
            fill="#F6F5F0"
            stroke="#1B222C"
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(-4 104 170)"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M74 ${146 + i * 13} q ${20 + (i % 3) * 8} ${i % 2 ? 2.5 : -2} ${52 - (i % 2) * 14} 0.5`}
              fill="none"
              stroke="#8FA998"
              strokeWidth="2"
              strokeLinecap="round"
              transform="rotate(-4 104 170)"
            />
          ))}
          <text x="104" y="278" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1B222C">
            01 · SOURCE
          </text>
          <text x="104" y="110" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="#1F5F5B">
            a rough transcript
          </text>
        </g>

        <g className="assembly-stage">
          {/* Stage 2 — structuring: pages fanning into order */}
          <g transform="translate(330 128)">
            <rect x="-6" y="8" width="76" height="96" rx="2" fill="#F6F5F0" stroke="#8FA998" strokeWidth="1.5" transform="rotate(-7 32 56)" />
            <rect x="0" y="4" width="76" height="96" rx="2" fill="#F6F5F0" stroke="#8FA998" strokeWidth="1.5" transform="rotate(-2 38 52)" />
            <rect x="6" y="0" width="76" height="96" rx="2" fill="#F6F5F0" stroke="#1B222C" strokeWidth="2" />
            <path d="M18 22 h52 M18 38 h52 M18 54 h34" stroke="#1F5F5B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 72 h52 M18 82 h44" stroke="#8FA998" strokeWidth="2" strokeLinecap="round" />
          </g>
          <text x="374" y="278" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1B222C">
            02 · CREATE
          </text>
          <text x="374" y="110" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="#1F5F5B">
            chapters take shape
          </text>
        </g>

        <g className="assembly-stage">
          {/* Stage 3 — the finished book */}
          <g transform="translate(600 120)">
            <path d="M4 6 q -4 50 0 100 l 10 6 V 12 z" fill="#174a46" stroke="#1B222C" strokeWidth="2" strokeLinejoin="round" />
            <rect x="14" y="2" width="78" height="112" rx="2" fill="#1F5F5B" stroke="#1B222C" strokeWidth="2" />
            <rect x="14" y="16" width="78" height="5" fill="#D9A441" />
            <rect x="14" y="92" width="78" height="5" fill="#D9A441" />
            <text x="53" y="52" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="15" fill="#F6F5F0">
              THE 30-DAY
            </text>
            <text x="53" y="70" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="15" fill="#F6F5F0">
              LAUNCH
            </text>
          </g>
          <text x="650" y="278" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1B222C">
            03 · DISTRIBUTE
          </text>
          <text x="650" y="110" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="#1F5F5B">
            a cover, a compliance pass
          </text>
        </g>

        <g className="assembly-stage">
          {/* Outcome — storefront thumbnail with a price tag */}
          <g transform="translate(830 140)">
            <rect x="0" y="0" width="64" height="88" rx="3" fill="#F6F5F0" stroke="#1B222C" strokeWidth="2" />
            <rect x="8" y="8" width="48" height="56" rx="2" fill="#1F5F5B" />
            <rect x="8" y="20" width="48" height="3" fill="#D9A441" />
            <path d="M12 76 h30" stroke="#1B222C" strokeWidth="2.5" strokeLinecap="round" />
            <g transform="rotate(8 78 -2)">
              <rect x="46" y="-14" width="34" height="18" rx="3" fill="#D9A441" stroke="#1B222C" strokeWidth="1.5" />
              <text x="63" y="-1" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="#1B222C">
                $19
              </text>
            </g>
          </g>
          <text x="862" y="278" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="#1B222C">
            → LISTED
          </text>
          <text x="862" y="110" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="#1F5F5B">
            ready to sell
          </text>
        </g>

        {/* Hand-drawn arrows between stages */}
        <path className="assembly-path" d="M200 180 q 40 -14 88 -6" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "0.5s" }} />
        <path d="M281 170 l 9 4 -7 7" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="assembly-path" d="M470 176 q 46 -12 106 -4" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "1s" }} />
        <path d="M568 165 l 10 5 -8 7" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="assembly-path" d="M712 176 q 50 -10 104 -2" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: "1.5s" }} />
        <path d="M808 168 l 10 4 -7 8" fill="none" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
