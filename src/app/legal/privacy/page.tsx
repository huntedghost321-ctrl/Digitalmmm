import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="9 July 2026">
      <p>
        This policy explains what personal data digitalmmm collects, why, and the rights
        you have over it. We comply with the EU/UK GDPR and the Nigeria Data Protection
        Act (NDPA) 2023.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data</strong> — email address and sign-in provider (email, Google or GitHub). OAuth sign-in never gives us your Google/GitHub password.</li>
        <li><strong>Content</strong> — the topics, URLs and PDFs you provide, and the products you generate.</li>
        <li><strong>Billing data</strong> — handled by Stripe. We store only your Stripe customer reference, plan and subscription status; card numbers never touch our systems.</li>
        <li><strong>Usage records</strong> — credit spends, exports and notifications tied to your account.</li>
      </ul>
      <p>
        We practice data minimisation: we collect nothing beyond what the features above
        need, and we do not sell personal data or use your content to train AI models by
        default.
      </p>

      <h2>How content is processed</h2>
      <p>
        To generate products, your source material is sent to our AI provider (Anthropic)
        for processing. It is used to produce your output, not to build advertising
        profiles.
      </p>

      <h2>Cookies</h2>
      <p>
        We set essential cookies only (session/sign-in). Non-essential cookies run only if
        you accept them in the consent banner.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li><strong>Access &amp; portability</strong> — export everything we hold on you, in one click, from Settings.</li>
        <li><strong>Erasure</strong> — delete your account and all data from Settings; deletion is immediate or completed within 30 days.</li>
        <li><strong>Rectification, restriction, objection</strong> — email us and we&apos;ll act within the statutory window.</li>
        <li>You may lodge a complaint with your supervisory authority (EU/UK) or the Nigeria Data Protection Commission.</li>
      </ul>

      <h2>Storage and security</h2>
      <p>
        Data is stored with Supabase (Postgres) with row-level security, encrypted in
        transit (TLS 1.3) and at rest. Access follows least-privilege; admin actions are
        logged. See our security overview in the repository&apos;s SECURITY documentation.
      </p>

      <h2>Retention</h2>
      <p>
        Your data is kept while your account exists. Deleting your account removes it.
        Financial records required by law are retained for the statutory period only.
      </p>

      <h2>Nigeria (NDPA)</h2>
      <p>
        digitalmmm is registered with the NDPC where required, has appointed a Data
        Protection Officer, and undergoes the required annual compliance audit. NDPA data
        subjects can exercise all rights above via support@digitalmmm.com, marked
        &ldquo;Data request&rdquo;.
      </p>

      <h2>Contact</h2>
      <p>
        Data Protection Officer — support@digitalmmm.com (subject line: &ldquo;DPO&rdquo;).
      </p>
    </LegalPage>
  );
}
