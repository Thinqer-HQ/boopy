import type { Metadata } from "next";
import "../legal/legal-page.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Boopy",
  description: "How Boopy collects, uses, and protects your personal data. GDPR-compliant.",
};

export default function PrivacyPage() {
  return (
    <div className="legal-body">
      <h1>Privacy Policy</h1>
      <p className="legal-meta">
        Effective Date: June 12, 2026 &nbsp;·&nbsp; Last Updated: June 12, 2026
      </p>

      <div className="legal-highlight">
        We don&apos;t sell your data. We don&apos;t run ads. We don&apos;t load tracking pixels from
        advertisers. Boopy exists to track your subscriptions — that&apos;s the only reason your
        data is on our system.
      </div>

      <p>
        This Privacy Policy explains how NAAX TECHNOLOGIES CORP. (&ldquo;Boopy,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and protects your personal data when you
        use the Boopy web app and website (the &ldquo;Service&rdquo;). It is written to comply with
        the EU General Data Protection Regulation (GDPR) and the UK GDPR.
      </p>

      <h2>1. Who is the data controller</h2>
      <p>
        NAAX TECHNOLOGIES CORP., a company registered in the Philippines.
        <br />
        For any privacy question or to exercise a right under this policy:{" "}
        <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
      </p>

      <h2>2. What data we collect, and why</h2>
      <p>We only collect what we need to run the Service.</p>

      <h3>Account data</h3>
      <p>
        Email address, name, password hash (or Google OAuth identifier), workspace name.
        <br />
        <strong>Purpose:</strong> to create and secure your account.
        <br />
        <strong>Legal basis:</strong> contract — GDPR Art. 6(1)(b)
      </p>

      <h3>Subscription data you enter</h3>
      <p>
        Service names, amounts, currencies, renewal dates, cadences, group/cost-centre tags, notes,
        attached receipts or invoices.
        <br />
        <strong>Purpose:</strong> to provide the core tracking and reminder functionality you signed
        up for.
        <br />
        <strong>Legal basis:</strong> contract — Art. 6(1)(b)
      </p>

      <h3>Notification preferences</h3>
      <p>
        Email reminder settings, push notification endpoints (Web Push / VAPID), reminder lead
        times.
        <br />
        <strong>Purpose:</strong> to send you the renewal alerts you&apos;ve configured.
        <br />
        <strong>Legal basis:</strong> contract — Art. 6(1)(b)
      </p>

      <h3>Billing data</h3>
      <p>
        Plan, billing cycle, Stripe customer ID, invoice history. We do not store your card number —
        Stripe handles that.
        <br />
        <strong>Purpose:</strong> to process payment for the Pro plan.
        <br />
        <strong>Legal basis:</strong> contract — Art. 6(1)(b)
      </p>

      <h3>Integration data (only if you enable it)</h3>
      <p>
        Google OAuth tokens (Calendar / Drive scopes); file metadata from a Drive folder you
        explicitly name; calendar event IDs we&apos;ve created on your behalf.
        <br />
        <strong>Purpose:</strong> to sync renewals to your calendar and import subscriptions from
        your invoices.
        <br />
        <strong>Legal basis:</strong> contract — Art. 6(1)(b); you can disconnect at any time.
      </p>

      <h3>Usage analytics</h3>
      <p>
        Anonymised product events (which features you use, error states, performance). Collected via
        PostHog.
        <br />
        <strong>Purpose:</strong> to improve the Service.
        <br />
        <strong>Legal basis:</strong> legitimate interests — Art. 6(1)(f); you can opt out via the
        cookie banner.
      </p>

      <h3>AI assistant interactions</h3>
      <p>
        Questions and context you send to &ldquo;Ask Boopy&rdquo; or the landing-page chat.
        Processed by OpenAI; not used to train their models (we use the API, not consumer products).
        <br />
        <strong>Purpose:</strong> to answer your questions.
        <br />
        <strong>Legal basis:</strong> contract — Art. 6(1)(b)
      </p>

      <h3>Technical logs</h3>
      <p>
        IP address, user agent, request timestamps, error traces. Held in Sentry (errors) and Axiom
        (server logs).
        <br />
        <strong>Purpose:</strong> security, debugging, abuse prevention.
        <br />
        <strong>Legal basis:</strong> legitimate interests — Art. 6(1)(f)
      </p>

      <h2>3. What we don&apos;t collect</h2>
      <ul>
        <li>We don&apos;t load advertising trackers</li>
        <li>We don&apos;t sell or share data with data brokers</li>
        <li>We don&apos;t profile you for marketing</li>
        <li>
          We don&apos;t read your Google Drive beyond the single folder you name for invoice imports
        </li>
        <li>We don&apos;t store your payment card details</li>
      </ul>

      <h2>4. How long we keep your data</h2>
      <ul>
        <li>
          <strong>Active account:</strong> for as long as your account exists
        </li>
        <li>
          <strong>After you delete your account:</strong> account, subscription, group, and
          notification data is deleted immediately and irreversibly (hard delete with database
          cascade)
        </li>
        <li>
          <strong>Billing records:</strong> retained by Stripe and in our records for 7 years to
          meet tax and accounting law
        </li>
        <li>
          <strong>Server logs and error traces:</strong> retained for 30 days, then purged
        </li>
        <li>
          <strong>Analytics events (PostHog):</strong> retained for 12 months in anonymised form
        </li>
      </ul>

      <h2>5. Your rights under GDPR</h2>
      <p>
        We&apos;ve built each right into the product so you don&apos;t need to email us to exercise
        them.
      </p>
      <table>
        <thead>
          <tr>
            <th>Right</th>
            <th>How to use it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Access (Art. 15)</strong>
            </td>
            <td>
              Settings → Account &amp; Privacy → &ldquo;Export my data&rdquo; — downloads a JSON
              file with everything we hold
            </td>
          </tr>
          <tr>
            <td>
              <strong>Portability (Art. 20)</strong>
            </td>
            <td>Same export — it&apos;s machine-readable JSON, the standard portable format</td>
          </tr>
          <tr>
            <td>
              <strong>Rectification (Art. 16)</strong>
            </td>
            <td>Edit your workspace, subscriptions, and groups directly in the app at any time</td>
          </tr>
          <tr>
            <td>
              <strong>Erasure (Art. 17)</strong>
            </td>
            <td>
              Settings → Account &amp; Privacy → &ldquo;Delete my account&rdquo; — cancels Stripe,
              hard-deletes data, removes your auth user
            </td>
          </tr>
          <tr>
            <td>
              <strong>Restriction (Art. 18)</strong>
            </td>
            <td>
              <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Object (Art. 21)</strong>
            </td>
            <td>
              <a href="mailto:privacy@boopy.app">privacy@boopy.app</a> — applies to processing based
              on legitimate interests
            </td>
          </tr>
          <tr>
            <td>
              <strong>Withdraw consent</strong>
            </td>
            <td>
              Disable PostHog analytics via the cookie banner; disconnect Google integrations from
              Settings
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        You also have the right to lodge a complaint with your local data protection authority. In
        the EU:{" "}
        <a
          href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
          target="_blank"
          rel="noopener noreferrer"
        >
          edpb.europa.eu
        </a>
        . In the UK:{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
          ico.org.uk
        </a>
        .
      </p>

      <h2>6. Sub-processors</h2>
      <table>
        <thead>
          <tr>
            <th>Sub-processor</th>
            <th>Purpose</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Database, authentication, file storage</td>
            <td>EU region available</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Payment processing</td>
            <td>US / EU</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Transactional email (renewal reminders)</td>
            <td>US</td>
          </tr>
          <tr>
            <td>PostHog</td>
            <td>Product analytics (anonymised)</td>
            <td>EU region available</td>
          </tr>
          <tr>
            <td>Google</td>
            <td>OAuth login, Calendar sync, Drive invoice import</td>
            <td>US / EU</td>
          </tr>
          <tr>
            <td>OpenAI</td>
            <td>AI assistant and landing-page chat support</td>
            <td>US</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Hosting and serverless compute</td>
            <td>US / EU</td>
          </tr>
          <tr>
            <td>Sentry</td>
            <td>Error monitoring</td>
            <td>US</td>
          </tr>
          <tr>
            <td>Axiom</td>
            <td>Server-side logging</td>
            <td>US</td>
          </tr>
        </tbody>
      </table>
      <p>
        For transfers outside the EEA, we rely on Standard Contractual Clauses (SCCs) or the
        sub-processor&apos;s adequacy decision where applicable.
      </p>

      <h2>7. Security</h2>
      <p>
        All data is encrypted in transit (TLS) and at rest. Row-Level Security (RLS) in our database
        means your workspace data can only be accessed by you. OAuth tokens are stored encrypted and
        never exposed in data exports. We use short-lived JWTs for authentication sessions.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not intended for users under 16. We do not knowingly collect personal data
        from children. If you believe a child has provided us with data, contact{" "}
        <a href="mailto:privacy@boopy.app">privacy@boopy.app</a> and we will delete it promptly.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        If we make material changes, we will notify you by email at least 14 days before the change
        takes effect. Non-material changes (e.g. updating sub-processor lists) take effect on the
        &ldquo;Last Updated&rdquo; date. Continued use of the Service after the effective date
        constitutes acceptance.
      </p>

      <h2>10. Contact</h2>
      <p>
        For any privacy question: <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
      </p>
    </div>
  );
}
