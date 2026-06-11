import type { Metadata } from "next";
import "../legal/legal-page.css";

export const metadata: Metadata = {
  title: "Terms of Service — Boopy",
  description:
    "The legal agreement between you and Boopy. Covers accounts, billing, refunds, and acceptable use.",
};

export default function TermsPage() {
  return (
    <div className="legal-body">
      <h1>Terms of Service</h1>
      <p className="legal-meta">
        Effective Date: June 12, 2026 &nbsp;·&nbsp; Last Updated: June 12, 2026
      </p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you and NAAX
        TECHNOLOGIES CORP., a company registered in the Philippines (&ldquo;Boopy,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;). They govern your use of the Boopy web app and website
        (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these
        Terms. If you don&apos;t agree, don&apos;t use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        Boopy is a subscription-management web app. It lets you track recurring subscriptions,
        receive renewal reminders, organise spend across groups, sync to your calendar, import
        receipts from your Drive, and ask an AI assistant for subscription advice.
      </p>

      <h2>2. Your account</h2>
      <p>To use Boopy you must:</p>
      <ul>
        <li>
          Be at least 16 years old (or the age of digital consent in your country, whichever is
          higher)
        </li>
        <li>Provide a valid email address (or sign in with Google)</li>
        <li>
          Keep your login credentials secure — you&apos;re responsible for activity on your account
        </li>
        <li>Provide accurate billing information if you upgrade to a paid plan</li>
      </ul>
      <p>
        You can create one account per person. Sharing an account with another person is not
        permitted. If your team needs separate workspaces, each person should have their own
        account.
      </p>

      <h2>3. Acceptable use</h2>
      <p>When using Boopy, you agree not to:</p>
      <ul>
        <li>Use the Service for anything illegal</li>
        <li>Reverse engineer, scrape, or attempt to extract source code from the Service</li>
        <li>Use the Service to send spam, malware, or any kind of unsolicited messaging</li>
        <li>Attempt to bypass rate limits, plan limits, or access controls</li>
        <li>
          Use the AI assistant to generate content that violates the law or OpenAI&apos;s usage
          policies
        </li>
        <li>Resell or sublicense access to the Service without our written permission</li>
        <li>Interfere with other users&apos; use of the Service</li>
      </ul>
      <p>We may suspend or terminate your account if you violate this section.</p>

      <h2>4. Subscription plans, pricing, and billing</h2>

      <h3>Free plan</h3>
      <ul>
        <li>Up to 30 subscriptions and 3 groups</li>
        <li>Basic renewal reminders</li>
        <li>No charge</li>
      </ul>

      <h3>Pro plan</h3>
      <ul>
        <li>Unlimited subscriptions and groups</li>
        <li>All integrations and features</li>
        <li>
          $19/month (introductory price; standard price is $29/month), or $15/month billed annually
          ($180/year)
        </li>
      </ul>

      <h3>Free trial</h3>
      <ul>
        <li>7-day free trial of the Pro plan</li>
        <li>A valid payment card is required at sign-up</li>
        <li>
          If you don&apos;t cancel before the trial ends, your card is charged automatically and the
          subscription begins
        </li>
      </ul>

      <h3>Billing</h3>
      <ul>
        <li>
          Subscriptions renew automatically at the end of each billing cycle (monthly or annual)
        </li>
        <li>All payments are processed by Stripe</li>
        <li>
          Prices are in USD and exclude applicable taxes (VAT, GST, sales tax), which will be added
          at checkout where required by law
        </li>
        <li>
          You can switch from monthly to annual at any time; the change is prorated based on the
          unused portion of your current cycle
        </li>
      </ul>

      <h3>Failed payments</h3>
      <ul>
        <li>If a payment fails, we&apos;ll retry over a 14-day window</li>
        <li>During the retry window your account remains on Pro</li>
        <li>
          If all retries fail, your account is downgraded to the Free plan; your data is not deleted
        </li>
      </ul>

      <h3>Price changes</h3>
      <p>
        We may change prices for future billing cycles with at least 30 days&apos; notice by email.
        Price changes do not apply to the current paid cycle you&apos;ve already been billed for.
      </p>

      <h2>5. Refunds and cancellation</h2>

      <div className="legal-highlight">
        <strong>15-day money-back guarantee.</strong> If you&apos;re charged for the Pro plan (i.e.
        your trial ended and the first charge went through), you can request a full refund within 15
        days of that first charge. After 15 days, refunds are no longer available. To request a
        refund, email <a href="mailto:support@boopy.app">support@boopy.app</a> within the 15-day
        window.
      </div>

      <p>
        <strong>Cancellation.</strong> You can cancel your Pro subscription at any time from
        Settings → Billing. Cancellation stops future renewals; you keep Pro access until the end of
        the billing cycle you&apos;ve already paid for. We do not pro-rate refunds for partial
        cycles after the 15-day window.
      </p>
      <p>
        <strong>Account deletion.</strong> You can delete your account at any time from Settings →
        Account &amp; Privacy. Deletion cancels any active Stripe subscription, hard-deletes your
        subscription, group, and notification data, and removes your auth user. Billing records are
        retained for 7 years as required by tax law. Deletion is irreversible.
      </p>

      <h2>6. Free trial — specific terms</h2>
      <ul>
        <li>One trial per person</li>
        <li>Card required at sign-up to start the trial</li>
        <li>You will not be charged during the 7-day trial</li>
        <li>You can cancel from Settings → Billing at any time during the trial with no charge</li>
        <li>
          If you don&apos;t cancel, the subscription begins automatically at the end of the trial
          and the first charge is taken
        </li>
        <li>
          The 15-day money-back guarantee starts from that first charge, not from the start of the
          trial
        </li>
      </ul>

      <h2>7. AI assistant and chat widget</h2>
      <p>
        The Service includes AI features powered by OpenAI: the in-app &ldquo;Ask Boopy&rdquo;
        assistant (GPT-4 class model) and the landing-page chat widget (GPT-4o-mini).
      </p>
      <ul>
        <li>
          AI output may be inaccurate. Don&apos;t rely on it for legal, financial, or tax decisions
        </li>
        <li>
          Your prompts and relevant subscription context are processed by OpenAI under their API
          terms. OpenAI does not use API data to train their models
        </li>
        <li>
          Don&apos;t share sensitive personal data (passwords, card numbers, government IDs) with
          the AI assistant
        </li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        Boopy and all its software, design, and content are owned by NAAX TECHNOLOGIES CORP.. We
        grant you a limited, non-exclusive, non-transferable licence to use the Service for your own
        personal or internal business purposes. You retain ownership of all data you enter into the
        Service. You grant us a limited licence to store and process that data solely to provide the
        Service.
      </p>

      <h2>9. Availability and changes</h2>
      <p>
        We aim for high availability but do not guarantee uninterrupted access. We may modify,
        suspend, or discontinue any part of the Service at any time. For material changes that
        reduce functionality, we will give at least 30 days&apos; notice by email. If we discontinue
        the Service entirely, we will give at least 60 days&apos; notice and ensure you can export
        your data.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, NAAX TECHNOLOGIES CORP. is not liable for any
        indirect, incidental, special, consequential, or punitive damages arising out of or related
        to your use of the Service, even if we have been advised of the possibility of such damages.
        Our total liability to you for any claim shall not exceed the amount you paid us in the 12
        months preceding the claim.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Philippines. Any dispute will be subject to the
        exclusive jurisdiction of the courts of the Philippines, except where applicable consumer
        protection law provides otherwise.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms. Material changes will be communicated by email at least 14 days
        before taking effect. Continued use after that date constitutes acceptance. If you
        don&apos;t accept the changes, you may cancel before the effective date.
      </p>

      <h2>13. Contact</h2>
      <p>
        <a href="mailto:support@boopy.app">support@boopy.app</a>
      </p>
    </div>
  );
}
