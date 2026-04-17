import Link from "next/link";

import { getMarketingContent } from "@/lib/payload";

export default async function MarketingHomePage() {
  const content = await getMarketingContent();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner container">
          <div className="brand">Boopy</div>
          <div className="nav-actions">
            <Link href="/studio" className="btn btn-outline">
              Open Puck editor
            </Link>
            <a href={content.dashboardUrl} className="btn btn-primary">
              Open dashboard
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-grid container">
            <div>
              <span className="pill">{content.heroBadge}</span>
              <h1 className="title">{content.heroTitle}</h1>
              <p className="subtitle">{content.heroSubtitle}</p>
              <div className="hero-cta">
                <a href={content.primaryCta.url} className="btn btn-primary">
                  {content.primaryCta.label}
                </a>
                <a href={content.secondaryCta.url} className="btn btn-outline">
                  {content.secondaryCta.label}
                </a>
              </div>
            </div>
            <div className="stats">
              <div className="card">
                <strong>{content.seo.title}</strong>
                <p className="subtitle">{content.seo.description}</p>
              </div>
              <div className="card">
                <strong>Built for founders and agencies</strong>
                <p className="subtitle">
                  Track internal tools and client subscriptions with a shared workflow.
                </p>
              </div>
              <div className="card">
                <strong>Operate with confidence</strong>
                <p className="subtitle">
                  Avoid missed renewals and late reactions through structured reminders and reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Why teams switch to Boopy</h2>
            <div className="feature-grid">
              {content.features.map((feature) => (
                <div key={feature.title} className="card feature-item">
                  <strong>{feature.title}</strong>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Simple pricing that scales with you</h2>
            <div className="pricing-grid">
              <div className="card">
                <strong>{content.pricing.free.label}</strong>
                <p className="price">{content.pricing.free.price}</p>
                <p className="subtitle">{content.pricing.free.description}</p>
                <ul className="list">
                  {content.pricing.free.features.map((feature) => (
                    <li key={`free-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <a className="btn btn-outline" href={content.dashboardUrl}>
                  {content.pricing.free.ctaLabel}
                </a>
              </div>
              <div className="card">
                <strong>{content.pricing.pro.label}</strong>
                <p className="price">
                  {content.pricing.pro.price}
                  <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>/mo</span>
                </p>
                <p className="subtitle">{content.pricing.pro.description}</p>
                <ul className="list">
                  {content.pricing.pro.features.map((feature) => (
                    <li key={`pro-${feature}`}>{feature}</li>
                  ))}
                </ul>
                <a
                  className="btn btn-primary"
                  href={`${content.dashboardUrl.replace("/login", "")}/settings/billing`}
                >
                  {content.pricing.pro.ctaLabel}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>What operators say</h2>
            <div className="feature-grid">
              {content.testimonials.map((testimonial) => (
                <div key={testimonial.quote} className="card">
                  <p className="subtitle" style={{ marginTop: 0 }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <strong>{testimonial.name}</strong>
                  <p className="subtitle" style={{ margin: "0.2rem 0 0" }}>
                    {testimonial.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>FAQs</h2>
            <div className="feature-grid">
              {content.faqs.map((faq) => (
                <div key={faq.question} className="card">
                  <strong>{faq.question}</strong>
                  <p className="subtitle">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          Boopy marketing app • Separate deployment from dashboard app
        </div>
      </footer>
    </>
  );
}
