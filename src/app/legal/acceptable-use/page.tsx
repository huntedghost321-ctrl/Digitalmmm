import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Acceptable Use Policy" };

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable Use & Content Policy" updated="9 July 2026">
      <p>
        digitalmmm exists to help creators make legitimate digital products. These rules
        are conditions of use; violating them can lead to content removal or account
        suspension.
      </p>

      <h2>You must not use digitalmmm to create or distribute</h2>
      <ul>
        <li>
          <strong>Non-consensual sexually explicit or intimate content — absolute
          prohibition.</strong> This is a hard legal prohibition (EU AI Act amendments),
          not a preference.
        </li>
        <li>Content sexualising minors, in any form.</li>
        <li>
          Content impersonating a real person, or cloning any person&apos;s voice or likeness
          without their documented consent (when voice features ship, they will be
          restricted to your own verified voice).
        </li>
        <li>
          Fake reviews or fabricated testimonials, including presenting AI-generated
          promotional content as a genuine customer review (an FTC violation with no
          disclosure cure).
        </li>
        <li>Malware, phishing content, or instructions for serious harm.</li>
        <li>
          Reproductions of other creators&apos; copyrighted work. Analysing a proven product&apos;s
          <em> structure</em> is fine; copying its text is not.
        </li>
        <li>Spam at scale, or content designed to deceive marketplaces (fake AI-content declarations, manipulated metadata).</li>
      </ul>

      <h2>Fair use of generation credits</h2>
      <p>
        Credits cap each plan&apos;s generation volume, which keeps pricing honest. Automating
        bulk generation through the UI to evade credit limits, sharing one account across
        a team (Team accounts are coming as their own feature), or reselling raw API
        access are not permitted.
      </p>

      <h2>Publishing responsibilities</h2>
      <p>
        When you sell generated products on third-party marketplaces you are the
        publisher: marketplace AI-disclosure rules (e.g. Amazon KDP&apos;s), consumer law and
        advertising-disclosure rules apply to you. Our compliance tools help you catch
        issues, but they don&apos;t replace your responsibility.
      </p>

      <h2>Reporting</h2>
      <p>
        To report content that violates this policy or the law, email
        support@digitalmmm.com with the subject &ldquo;Report&rdquo;. Reports are reviewed by a
        human.
      </p>
    </LegalPage>
  );
}
