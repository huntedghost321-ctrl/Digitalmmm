import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/source-sans-3";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: {
    default: "digitalmmm — turn raw material into finished digital products",
    template: "%s · digitalmmm",
  },
  description:
    "An AI studio that takes a topic, a PDF or a website and turns it into a finished, sellable ebook, workbook or planner — with compliance checks and real exports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
