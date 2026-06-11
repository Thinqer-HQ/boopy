import type { Metadata } from "next";
import "../legal/legal-page.css";

export const metadata: Metadata = {
  title: "Cookie Policy — Boopy",
  description: "What cookies Boopy uses and how to control them.",
};

export default function CookiesPage() {
  return (
    <div className="legal-body">
      <h1>Cookie Policy</h1>
      <p className="legal-meta">
        Effective Date: June 12, 2026 &nbsp;·&nbsp; Last Updated: June 12, 2026
      </p>

      <div className="legal-highlight">
        We keep this short because we don&apos;t use many cookies. No advertising cookies, no
        third-party trackers, no cross-site tracking pixels.
      </div>

      <p>
        This Cookie Policy explains how NAAX TECHNOLOGIES CORP. (&ldquo;Boopy&rdquo;) uses cookies
        and similar technologies on the Boopy website and web app. It supplements our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>What cookies we use</h2>

      <h3>Strictly necessary (always on)</h3>
      <p>
        These cookies are required to deliver the Service. You can&apos;t turn them off, because
        without them the app won&apos;t work.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie / token</th>
            <th>Purpose</th>
            <th>Set by</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase auth session (JWT)</td>
            <td>Keeps you logged in</td>
            <td>Supabase</td>
            <td>Session + refresh token (~1 hour access, ~30 day refresh)</td>
          </tr>
          <tr>
            <td>CSRF token</td>
            <td>Protects form submissions from cross-site request forgery</td>
            <td>Boopy</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>Stripe session cookie (checkout only)</td>
            <td>Required during payment flow on Stripe-hosted pages</td>
            <td>Stripe</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Legal basis:</strong> these are exempt from the consent requirement under the
        ePrivacy Directive because they are strictly necessary to provide the Service you requested.
      </p>

      <h3>Analytics (optional — your choice)</h3>
      <p>
        We use PostHog to understand how the app is used, find bugs, and improve features. Events
        are anonymised and do not include subscription details, amounts, or other personal data
        beyond what&apos;s needed to identify a session.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Set by</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ph_* cookies</td>
            <td>Anonymised product analytics — page views, feature usage, error events</td>
            <td>PostHog</td>
            <td>Up to 12 months</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Legal basis:</strong> consent — we ask before setting these.
        <br />
        <strong>How to opt out:</strong> decline analytics in the cookie banner, or visit Settings →
        Privacy at any time to change your choice. If you decline, the app continues to work exactly
        the same.
      </p>

      <h2>What we don&apos;t use</h2>
      <ul>
        <li>Advertising cookies</li>
        <li>Cross-site tracking</li>
        <li>Social media tracking pixels (Facebook Pixel, LinkedIn Insight Tag, etc.)</li>
        <li>Fingerprinting</li>
        <li>Data sold or shared with brokers</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>You can control cookies in three ways:</p>
      <ol>
        <li>
          <strong>Cookie banner</strong> — when you first visit, you can accept or decline analytics
          cookies. Strictly necessary cookies are always on.
        </li>
        <li>
          <strong>In-app settings</strong> — Settings → Privacy lets you change your analytics
          preference at any time.
        </li>
        <li>
          <strong>Browser settings</strong> — every modern browser lets you block or delete cookies.
          If you block strictly necessary cookies, you won&apos;t be able to log in.
        </li>
      </ol>

      <h2>Changes to this policy</h2>
      <p>
        If we add, remove, or change a cookie, we&apos;ll update the table above and revise the
        &ldquo;Last Updated&rdquo; date. Material changes will trigger a fresh banner asking for
        your consent.
      </p>

      <h2>Contact</h2>
      <p>
        For any cookie or privacy question: <a href="mailto:privacy@boopy.app">privacy@boopy.app</a>
      </p>
    </div>
  );
}
