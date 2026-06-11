import { getMarketingContent } from "@/lib/payload";

export const dynamic = "force-dynamic";

const AUDIENCE_TICKER_LABELS = [
  "PERSONAL",
  "GROUPS",
  "AGENCIES",
  "BUSINESSES",
  "OPERATIONS TEAMS",
] as const;

const CheckIcon = () => (
  <svg viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 4l2.5 2.5L9 1"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default async function MarketingHomePage() {
  const content = await getMarketingContent();
  const appUrl = "https://www.useboopy.com";
  const upgradeUrl =
    process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL?.trim() || `${appUrl}/settings/billing`;
  const visibleFaqs = content.faqs.filter(
    (faq) => faq.question.trim().toLowerCase() !== "can non-technical teammates edit this page?"
  );

  return (
    <div className="page-shell">
      {/* Header is OUTSIDE content-shell so sticky works correctly */}
      <header className="header">
        <div className="header-inner container">
          <div className="brand-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/boopy-icon.png"
              alt=""
              width={32}
              height={32}
              className="brand-logo-img"
              aria-hidden="true"
            />
            <span className="brand-name">Boopy</span>
            <span className="brand-copy">{content.brandStatement}</span>
          </div>
          <nav className="nav-actions">
            <a href="#use-cases" className="nav-link">
              Use Cases
            </a>
            <a href="#pricing" className="nav-link">
              Pricing
            </a>
            <a
              href={appUrl}
              className="btn btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              Open app →
            </a>
          </nav>
        </div>
      </header>

      {/* content-shell clips overflow without breaking sticky */}
      <div className="content-shell">
        <main>
          {/* ── Hero ── */}
          <section className="hero section reveal-up">
            <div className="container">
              <div className="badge">
                <span className="badge-dot" />
                {content.heroBadge}
              </div>
              <h1 className="hero-title">{content.heroTitle}</h1>
              <p className="hero-subtitle">{content.heroSubtitle}</p>
              <div className="cta-row">
                <a href={appUrl} className="btn btn-primary btn-lg">
                  {content.primaryCta.label}
                </a>
                <a href={upgradeUrl} className="btn btn-ghost btn-lg">
                  {content.secondaryCta.label}
                </a>
              </div>
              <div className="hero-microproof">
                {content.socialProof.map((item) => (
                  <div key={`proof-${item.label}`} className="micro-pill">
                    <span className="micro-pill-dot" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Ticker ── */}
          <div className="ticker-section">
            <div className="ticker-wrap">
              <div className="ticker-viewport">
                <div className="ticker-track">
                  {AUDIENCE_TICKER_LABELS.map((label) => (
                    <span key={`a-${label}`} className="ticker-item">
                      {label}
                    </span>
                  ))}
                  {AUDIENCE_TICKER_LABELS.map((label) => (
                    <span key={`b-${label}`} className="ticker-item" aria-hidden="true">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="stats-strip">
            <div className="container">
              <div className="stats-grid">
                {content.socialProof.slice(0, 3).map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="stat-value">{item.value}</div>
                    <div className="stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Use cases ── */}
          <section id="use-cases" className="section">
            <div className="container">
              <div className="section-label">Who it's for</div>
              <h2 className="section-title">{content.audienceHeadline}</h2>
              <p className="section-subtitle">
                Whether you're tracking personal subscriptions or managing renewals for a whole
                team, Boopy adapts to how you work.
              </p>
              <div className="audience-grid" style={{ marginTop: "2.5rem" }}>
                {content.audiences.map((audience, index) => (
                  <article
                    key={audience.title}
                    className={`panel panel-accent${index === 0 ? "" : ""}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="feature-title">{audience.title}</span>
                    <p className="feature-desc">{audience.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Value pillars ── */}
          <section className="section" style={{ background: "var(--bg-soft)" }}>
            <div className="container">
              <div className="section-label">Why Boopy</div>
              <h2 className="section-title">{content.valueHeadline}</h2>
              <div className="value-grid" style={{ marginTop: "2.5rem" }}>
                {content.valuePillars.map((pillar, index) => (
                  <article
                    key={pillar.title}
                    className="panel"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="feature-icon" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
                      </svg>
                    </div>
                    <span className="feature-title">{pillar.title}</span>
                    <p className="feature-desc">{pillar.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features highlight band ── */}
          <section className="section">
            <div className="container">
              <div className="highlight-band">
                <div className="section-label" style={{ justifyContent: "center" }}>
                  Features
                </div>
                <h2
                  className="section-title"
                  style={{ margin: "0 auto 1rem", maxWidth: 560, textAlign: "center" }}
                >
                  Everything you need to manage subscriptions
                </h2>
                <p
                  className="section-subtitle"
                  style={{ margin: "0 auto 2.5rem", textAlign: "center" }}
                >
                  From tracking to renewal reminders — Boopy handles the full lifecycle.
                </p>
                <div className="card-grid-3" style={{ textAlign: "left" }}>
                  {content.features.map((feature) => (
                    <div key={feature.title} className="panel">
                      <span className="feature-title">{feature.title}</span>
                      <p className="feature-desc">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Pricing ── */}
          <section id="pricing" className="section pricing-section">
            <div className="container text-center">
              <div className="section-label" style={{ justifyContent: "center" }}>
                Pricing
              </div>
              <h2 className="section-title" style={{ margin: "0 auto 0.5rem" }}>
                Simple, honest pricing
              </h2>
              <p className="section-subtitle" style={{ margin: "0 auto" }}>
                Start free. Upgrade when you need more.
              </p>
              <div className="pricing-grid">
                <div className="panel pricing-card">
                  <span className="price-tier">{content.pricing.free.label}</span>
                  <h3>{content.pricing.free.price}</h3>
                  <p className="muted">{content.pricing.free.description}</p>
                  <ul className="feature-list">
                    {content.pricing.free.features.map((feature) => (
                      <li key={`free-${feature}`}>
                        <span className="check-icon">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="btn btn-ghost"
                    href={appUrl}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {content.pricing.free.ctaLabel}
                  </a>
                </div>
                <div className="panel pricing-card pricing-card-featured">
                  <span className="pricing-badge">Most Popular</span>
                  <span className="price-tier">{content.pricing.pro.label}</span>
                  <h3>{content.pricing.pro.price}/mo</h3>
                  <p className="muted">{content.pricing.pro.description}</p>
                  <ul className="feature-list">
                    {content.pricing.pro.features.map((feature) => (
                      <li key={`pro-${feature}`}>
                        <span className="check-icon">
                          <CheckIcon />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="btn btn-primary"
                    href={upgradeUrl}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {content.pricing.pro.ctaLabel}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── Testimonials ── */}
          <section className="section">
            <div className="container">
              <div className="section-label">What people say</div>
              <h2 className="section-title">Trusted by teams and individuals</h2>
              <div className="testimonials-grid">
                {content.testimonials.map((testimonial) => (
                  <article key={testimonial.quote} className="panel">
                    <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="testimonial-author">
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="section" style={{ background: "var(--bg-soft)" }}>
            <div className="container">
              <div className="section-label">FAQ</div>
              <h2 className="section-title">Quick answers</h2>
              <div className="faq-grid">
                {visibleFaqs.map((faq) => (
                  <article key={faq.question} className="panel">
                    <span className="faq-q">{faq.question}</span>
                    <p className="faq-a">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA band ── */}
          <section className="cta-band">
            <div className="container">
              <h2>Ready to stop missing renewals?</h2>
              <p>Join teams and individuals who use Boopy to stay on top of every subscription.</p>
              <div className="cta-row">
                <a href={appUrl} className="btn btn-primary btn-lg">
                  Get started free
                </a>
                <a href={upgradeUrl} className="btn btn-ghost btn-lg">
                  View Pro plan
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-inner container">
            <div>
              <div className="footer-brand">Boopy</div>
              <div className="footer-copy" style={{ marginTop: "0.25rem" }}>
                {content.seo.description}
              </div>
            </div>
            <div className="footer-actions">
              <a
                href={appUrl}
                className="btn btn-primary"
                style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
              >
                Open app →
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
