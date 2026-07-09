import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-baseline gap-1.5" aria-label="digitalmmm home">
      <span
        aria-hidden
        className={`inline-block h-3 w-3 translate-y-[-1px] rounded-[2px] ${dark ? "bg-amber" : "bg-teal"}`}
      />
      <span className={`font-display text-xl font-semibold tracking-tight ${dark ? "text-paper" : "text-ink"}`}>
        digitalmmm
      </span>
    </Link>
  );
}
