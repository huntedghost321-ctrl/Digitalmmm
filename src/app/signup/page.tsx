import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Start free" };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-6 py-20">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </main>
    </>
  );
}
