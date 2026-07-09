import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-mono text-sm text-teal">404</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">This page doesn&apos;t exist.</h1>
        <Link href="/" className="mt-6 inline-block rounded bg-teal px-5 py-2.5 text-sm font-medium text-paper hover:bg-teal-dark">
          Back to the studio
        </Link>
      </main>
    </>
  );
}
