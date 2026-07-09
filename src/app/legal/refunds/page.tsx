import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund Policy" updated="9 July 2026">
      <p>
        A standalone, plain-English refund policy — not buried in the Terms.
      </p>

      <h2>Subscriptions</h2>
      <ul>
        <li>
          <strong>EU/UK consumers:</strong> you have a 14-day right of withdrawal on
          digital purchases. At checkout we ask whether you consent to immediate access;
          giving that consent waives the withdrawal right, as EU law allows. If you do{" "}
          <em>not</em> consent (or simply don&apos;t use the service), contact us within 14
          days of purchase for a full refund.
        </li>
        <li>
          <strong>Everyone:</strong> if something is broken and we can&apos;t fix it within a
          reasonable time, we&apos;ll refund your current billing period — just email us.
        </li>
        <li>
          Cancelling stops future charges immediately; you keep access until the end of
          the paid period. We don&apos;t pro-rate partial months except as described above.
        </li>
      </ul>

      <h2>Credits</h2>
      <p>
        Credits spent on completed generations aren&apos;t refundable. If a generation fails
        due to a fault on our side, report it and we&apos;ll re-credit you.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <strong>support@digitalmmm.com</strong> from your account email with the
        subject &ldquo;Refund&rdquo;. We respond within 2 business days and process approved
        refunds to the original payment method via Stripe within 5–10 business days.
      </p>
    </LegalPage>
  );
}
