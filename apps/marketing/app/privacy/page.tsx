import type { Metadata } from "next";
import "../legal/legal-page.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Boopy",
  description:
    "How Boopy collects, uses, and protects your personal data. Compliant with GDPR, UK GDPR, and the Philippine Data Privacy Act (RA 10173).",
};

export default function PrivacyPage() {
  return (
    <div className="legal-body">
      <h1>Privacy Policy</h1>
      <p className="legal-meta">
        Effective Date: June 12, 2026 &nbsp;·&nbsp; Last Updated: June 15, 2026
      </p>

      <div className="legal-highlight">
        We don&apos;t sell your data. We don&apos;t run ads. We don&apos;t load tracking pixels from
        advertisers. Boopy exists to track your subscriptions — that&apos;s the only reason your
        data is on our system.
      </div>

      <p>
        This Privacy Policy explains how NAAX TECHNOLOGIES CORP. (&ldquo;Boopy,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and protects your personal data when you
        use the Boopy web app and website (the &ldquo;Service&rdquo;). This policy is written to
        comply with the EU General Data Protection Regulation (GDPR), the UK GDPR, and the
        Philippine Data Privacy Act of 2012 (Republic Act No. 10173 / &ldquo;RA 10173&rdquo;) and
        its Implementing Rules and Regulations.
      </p>

      <h2>1. Who is the data controller</h2>
      <p>
        NAAX TECHNOLOGIES CORP., a corporation registered in the Philippines.
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
        <strong>Legal basis (GDPR):</strong> contract — Art. 6(1)(b)
        <br />
        <strong>Legal basis (RA 10173):</strong> fulfilment of a contract — Sec. 12(b)
      </p>

      <h3>Subscription data you enter</h3>
      <p>
        Service names, amounts, currencies, renewal dates, cadences, group/cost-centre tags, notes,
        attached receipts or invoices.
        <br />
        <strong>Purpose:</strong> to provide the core tracking and reminder functionality you signed
        up for.
        <br />
        <strong>Legal basis (GDPR/RA 10173):</strong> contract
      </p>

      <h3>Notification preferences</h3>
      <p>
        Email reminder settings, push notification endpoints (Web Push / VAPID), reminder lead
        times.
        <br />
        <strong>Purpose:</strong> to send you the renewal alerts you&apos;ve configured.
        <br />
        <strong>Legal basis:</strong> contract
      </p>

      <h3>Billing data</h3>
      <p>
        Plan, billing cycle, Paddle customer ID, invoice history. We do not store your card number —
        Paddle handles that as our Merchant of Record.
        <br />
        <strong>Purpose:</strong> to process payment for the Pro plan.
        <br />
        <strong>Legal basis:</strong> contract
      </p>

      <h3>Integration data (only if you enable it)</h3>
      <p>
        Google OAuth tokens (Calendar / Drive scopes); file metadata from a Drive folder you
        explicitly name; calendar event IDs we&apos;ve created on your behalf.
        <br />
        <strong>Purpose:</strong> to sync renewals to your calendar and import subscriptions from
        your invoices.
        <br />
        <strong>Legal basis:</strong> contract; you can disconnect at any time.
      </p>

      <h3>Usage analytics</h3>
      <p>
        Anonymised product events (which features you use, error states, performance). Collected via
        PostHog.
        <br />
        <strong>Purpose:</strong> to improve the Service.
        <br />
        <strong>Legal basis (GDPR):</strong> legitimate interests — Art. 6(1)(f); you can opt out
        via the cookie banner.
        <br />
        <strong>Legal basis (RA 10173):</strong> legitimate interests of the controller — Sec. 12(f)
      </p>

      <h3>AI assistant interactions</h3>
      <p>
        Questions and context you send to &ldquo;Ask Boopy&rdquo; or the landing-page chat.
        Processed by OpenAI; not used to train their models (we use the API, not consumer products).
        <br />
        <strong>Purpose:</strong> to answer your questions.
        <br />
        <strong>Legal basis:</strong> contract
      </p>

      <h3>Technical logs</h3>
      <p>
        IP address, user agent, request timestamps, error traces. Held in Sentry (errors) and Axiom
        (server logs).
        <br />
        <strong>Purpose:</strong> security, debugging, abuse prevention.
        <br />
        <strong>Legal basis:</strong> legitimate interests
      </p>

      <h2>3. What we don&apos;t collect</h2>
      <ul>
        <li>We don&apos;t load advertising trackers</li>
        <li>We don&apos;t sell or share data with data brokers</li>
        <li>We don&apos;t profile you for marketing</li>
        <li>
          We don&apos;t read your Google Drive beyond the single folder you name for invoice imports
        </li>
        <li>We don&apos;t store your payment card details (Paddle holds those)</li>
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
          <strong>Billing records:</strong> retained by Paddle and in our records for 7 years to
          meet tax and accounting law
        </li>
        <li>
          <strong>Server logs and error traces:</strong> retained for 30 days, then purged
        </li>
        <li>
          <strong>Analytics events (PostHog):</strong> retained for 12 months in anonymised form
        </li>
      </ul>

      <h2>5. Your rights</h2>
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
              <strong>Access (GDPR Art. 15 / RA 10173 Sec. 16)</strong>
            </td>
            <td>
              Settings → Account &amp; Privacy → &ldquo;Export my data&rdquo; — downloads a JSON
              file with everything we hold
            </td>
          </tr>
          <tr>
            <td>
              <strong>Portability (GDPR Art. 20)</strong>
            </td>
            <td>Same export — machine-readable JSON</td>
          </tr>
          <tr>
            <td>
              <strong>Rectification (GDPR Art. 16 / RA 10173 Sec. 16)</strong>
            </td>
            <td>Edit your workspace, subscriptions, and groups directly in the app at any time</td>
          </tr>
          <tr>
            <td>
              <strong>Erasure / Blocking (GDPR Art. 17 / RA 10173 Sec. 16)</strong>
            </td>
            <td>
              Settings → Account &amp; Privacy → &ldquo;Delete my account&rdquo; — cancels Paddle,
              hard-deletes data, removes your auth user
            </td>
          </tr>
          <tr>
            <td>
              <strong>Restriction (GDPR Art. 18)</strong>
            </td>
            <td>
              <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Object (GDPR Art. 21 / RA 10173 Sec. 16)</strong>
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
      <p>You also have the right to lodge a complaint with your local data protection authority:</p>
      <ul>
        <li>
          <strong>Philippines (RA 10173):</strong>{" "}
          <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer">
            National Privacy Commission (NPC)
          </a>{" "}
          — privacy.gov.ph
        </li>
        <li>
          <strong>European Union:</strong>{" "}
          <a
            href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener noreferrer"
          >
            Your local EU supervisory authority
          </a>
        </li>
        <li>
          <strong>United Kingdom:</strong>{" "}
          <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
            Information Commissioner&apos;s Office (ICO)
          </a>
        </li>
      </ul>

      <h2>6. California residents (CCPA)</h2>
      <p>
        If you are a California resident, the California Consumer Privacy Act (CCPA / CPRA) grants
        you additional rights:
      </p>
      <ul>
        <li>
          <strong>Right to know</strong> what personal information we collect, use, disclose, or
          sell — see Section 2 above. We do not sell personal information.
        </li>
        <li>
          <strong>Right to delete</strong> personal information we hold about you — use the
          in-product account deletion flow or email{" "}
          <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>.
        </li>
        <li>
          <strong>Right to opt-out of sale or sharing</strong> — we do not sell or share personal
          information for cross-context behavioural advertising.
        </li>
        <li>
          <strong>Right to non-discrimination</strong> — exercising your privacy rights will not
          affect your access to the Service.
        </li>
      </ul>
      <p>
        To submit a verifiable request under the CCPA, email{" "}
        <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>. We will respond within 45 days.
      </p>

      <h2>7. Sub-processors</h2>
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
            <td>Paddle</td>
            <td>Payment processing (Merchant of Record)</td>
            <td>UK / US</td>
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
        For transfers outside the EEA or the Philippines, we rely on Standard Contractual Clauses
        (SCCs), adequacy decisions where applicable, or the sub-processor&apos;s own data transfer
        mechanisms as recognised under applicable law.
      </p>

      <h2>8. Security</h2>
      <p>
        All data is encrypted in transit (TLS) and at rest. Row-Level Security (RLS) in our database
        means your workspace data can only be accessed by you. OAuth tokens are stored encrypted and
        never exposed in data exports. We use short-lived JWTs for authentication sessions.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not intended for users under 16. We do not knowingly collect personal data
        from children. If you believe a child has provided us with data, contact{" "}
        <a href="mailto:privacy@boopy.app">privacy@boopy.app</a> and we will delete it promptly.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        If we make material changes, we will notify you by email at least 14 days before the change
        takes effect. Non-material changes (e.g. updating sub-processor lists) take effect on the
        &ldquo;Last Updated&rdquo; date. Continued use of the Service after the effective date
        constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        For any privacy question: <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
        <br />
        NAAX TECHNOLOGIES CORP., Philippines
      </p>
    </div>
  );
}
