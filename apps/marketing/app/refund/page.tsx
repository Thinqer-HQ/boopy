import type { Metadata } from "next";
import "../legal/legal-page.css";

export const metadata: Metadata = {
  title: "Refund Policy — Boopy",
  description:
    "Boopy's 15-day money-back guarantee. How to cancel your free trial or request a refund.",
};

export default function RefundPage() {
  return (
    <div className="legal-body">
      <h1>Refund Policy</h1>
      <p className="legal-meta">
        Effective Date: June 15, 2026 &nbsp;·&nbsp; Last Updated: June 15, 2026
      </p>

      <div className="legal-highlight">
        <strong>15-day money-back guarantee.</strong> If the Pro plan isn&apos;t right for you after
        your trial ends, email us within 15 days of your first charge and we will refund you in full
        — no questions asked.
      </div>

      <p>
        This Refund Policy is published by NAAX TECHNOLOGIES CORP. (&ldquo;Boopy,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;). Payments are processed by Paddle, our Merchant of
        Record. For full billing terms, see our <a href="/terms">Terms of Service</a>.
      </p>

      <h2>1. Free trial</h2>
      <p>
        Every Pro plan subscription starts with a <strong>7-day free trial</strong>. During the
        trial:
      </p>
      <ul>
        <li>You will not be charged at all</li>
        <li>A valid payment card is required to start the trial</li>
        <li>You can cancel at any time during the trial from Settings → Billing with no charge</li>
        <li>
          If you do not cancel before the trial ends, your card is automatically charged and your
          Pro subscription begins
        </li>
      </ul>

      <h2>2. 15-day money-back guarantee</h2>
      <p>
        After the trial ends and your first charge is taken, you have <strong>15 days</strong> to
        request a full refund. The 15-day window starts from the date of the first charge, not from
        the start of the trial.
      </p>
      <p>This guarantee applies to:</p>
      <ul>
        <li>
          <strong>Monthly plan:</strong> the first monthly charge after the trial ends
        </li>
        <li>
          <strong>Annual plan:</strong> the first annual charge after the trial ends
        </li>
      </ul>
      <p>
        Subsequent renewal charges (monthly or annual) are not covered by this guarantee. We
        recommend using the 7-day trial fully to evaluate Boopy before your first charge is taken.
      </p>

      <h2>3. How to request a refund</h2>
      <p>
        Email <a href="mailto:support@boopy.app">support@boopy.app</a> from the address associated
        with your Boopy account. Please include:
      </p>
      <ul>
        <li>Your name</li>
        <li>The email address on your Boopy account</li>
        <li>The reason for your refund request (optional, but helps us improve)</li>
      </ul>
      <p>
        We will confirm your refund eligibility within 2 business days. Once approved, refunds are
        processed through Paddle and typically appear on your original payment method within 5–10
        business days, depending on your bank or card issuer.
      </p>

      <h2>4. Refunds we do not issue</h2>
      <ul>
        <li>Requests made more than 15 days after the first charge</li>
        <li>Charges on subsequent monthly or annual billing cycles after the first</li>
        <li>Partial refunds for unused time remaining in the current billing cycle</li>
        <li>
          Accounts suspended or terminated for violations of our{" "}
          <a href="/terms">Terms of Service</a>
        </li>
      </ul>

      <h2>5. Cancellation</h2>
      <p>Cancellation and refunds are two separate things:</p>
      <ul>
        <li>
          <strong>Cancelling your subscription</strong> stops future charges. You keep Pro access
          until the end of the billing period you have already paid for. Cancelling alone does not
          automatically issue a refund.
        </li>
        <li>
          <strong>Requesting a refund</strong> within the 15-day window will also cancel your
          subscription immediately.
        </li>
      </ul>
      <p>
        To cancel: go to <strong>Settings → Billing</strong> in the Boopy app, or email{" "}
        <a href="mailto:support@boopy.app">support@boopy.app</a>.
      </p>

      <h2>6. Paddle as Merchant of Record</h2>
      <p>
        Boopy uses Paddle as its Merchant of Record. Paddle is responsible for processing your
        payment, issuing your invoice, and handling applicable taxes. Refund requests are
        coordinated by us and processed through Paddle&apos;s payment infrastructure. If you have
        questions about a specific charge or receipt, you can also contact Paddle directly.
      </p>

      <h2>7. Contact</h2>
      <p>
        For refund requests or billing questions:{" "}
        <a href="mailto:support@boopy.app">support@boopy.app</a>
        <br />
        NAAX TECHNOLOGIES CORP., Philippines
      </p>
    </div>
  );
}
