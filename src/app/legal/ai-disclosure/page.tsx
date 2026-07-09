import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "AI Disclosure" };

export default function AiDisclosurePage() {
  return (
    <LegalPage title="AI Disclosure & Provenance" updated="9 July 2026">
      <p>
        digitalmmm is an AI system provider under the EU AI Act. This page explains, in
        plain language, how we mark AI-generated content and what you need to do when you
        publish it.
      </p>

      <h2>What we mark, and how</h2>
      <ul>
        <li>
          Every PDF and DOCX export embeds <strong>machine-readable metadata</strong>{" "}
          identifying the file as AI-generated (generator, timestamp, product reference) —
          the transparency obligation in EU AI Act Article 50, binding from 2 August 2026.
        </li>
        <li>
          Every export also carries a short human-readable colophon line stating it was
          created with AI assistance.
        </li>
        <li>
          As image, audio and video generation ship, their outputs will carry C2PA
          content credentials — the same provenance standard used by Adobe, OpenAI,
          Google and Microsoft.
        </li>
      </ul>

      <h2>What you must do as a publisher</h2>
      <ul>
        <li>
          <strong>Amazon KDP:</strong> declare AI-generated content during title setup.
          Our KDP compliance checker reminds you on every check.
        </li>
        <li>
          <strong>Advertising:</strong> if you promote products with paid or sponsored
          content, disclose the sponsorship clearly (FTC &ldquo;clear and conspicuous&rdquo;
          standard in the US; equivalent rules in the EU/UK). Never present AI-generated
          promotional content as a genuine customer review.
        </li>
      </ul>

      <h2>What we will never build</h2>
      <ul>
        <li>Tools to strip provenance marking from generated content.</li>
        <li>Voice or likeness cloning of anyone other than the verified account owner.</li>
        <li>Generation of non-consensual intimate imagery — prohibited absolutely.</li>
      </ul>

      <p>
        Questions about provenance metadata in a specific file: support@digitalmmm.com.
      </p>
    </LegalPage>
  );
}
