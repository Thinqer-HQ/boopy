import Link from "next/link";

import { getMarketingContent } from "@/lib/payload";

export default async function MarketingHomePage() {
  const content = await getMarketingContent();

  return (
    <div className="site-shell">
      <div className="fx-glow fx-glow-left" />
      <div className="fx-glow fx-glow-right" />
      <header className="header">
        <div className="header-inner container">
          <div className="brand-wrap">
            <div className="brand-pill">Boopy</div>
            <span className="brand-copy">{content.brandStatement}</span>
          </div>
          <nav className="nav-actions">
            <a href="#pricing" className="btn btn-ghost">
              Pricing
            </a>
            <Link href="/studio" className="btn btn-ghost">
              Content Studio
            </Link>
            <a href={content.dashboardUrl} className="btn btn-primary">
              Open app
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section">
          <div className="hero-grid container">
            <div>
              <div className="badge">{content.heroBadge}</div>
              <h1 className="hero-title">{content.heroTitle}</h1>
              <p className="hero-subtitle">{content.heroSubtitle}</p>
              <div className="cta-row">
                <a href={content.primaryCta.url} className="btn btn-primary">
                  {content.primaryCta.label}
                </a>
                <a href={content.secondaryCta.url} className="btn btn-ghost">
                  {content.secondaryCta.label}
                </a>
              </div>
            </div>
            <div className="panel highlight-panel">
              <p className="panel-eyebrow">Why teams move to Boopy</p>
              <div className="stack">
                {content.features.map((feature) => (
                  <div key={feature.title} className="mini-card">
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="social-proof-grid">
              {content.socialProof.map((item) => (
                <article key={item.label} className="panel social-proof-item">
                  <p className="metric">{item.value}</p>
                  <p className="muted">{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">{content.audienceHeadline}</h2>
            <div className="audience-grid">
              {content.audiences.map((audience) => (
                <article key={audience.title} className="panel audience-item">
                  <strong>{audience.title}</strong>
                  <p className="muted">{audience.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">{content.valueHeadline}</h2>
            <div className="three-grid">
              {content.valuePillars.map((pillar) => (
                <article key={pillar.title} className="panel value-item">
                  <strong>{pillar.title}</strong>
                  <p className="muted">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="pricing-layout container">
            <div className="panel pricing-card">
              <span className="price-tier">{content.pricing.free.label}</span>
              <h3>{content.pricing.free.price}</h3>
              <p className="muted">{content.pricing.free.description}</p>
              <ul className="list">
                {content.pricing.free.features.map((feature) => (
                  <li key={`free-${feature}`}>{feature}</li>
                ))}
              </ul>
              <a className="btn btn-ghost" href={content.dashboardUrl}>
                {content.pricing.free.ctaLabel}
              </a>
            </div>
            <div className="panel pricing-card pricing-card-featured">
              <span className="price-tier">{content.pricing.pro.label}</span>
              <h3>{content.pricing.pro.price}/mo</h3>
              <p className="muted">{content.pricing.pro.description}</p>
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
        </section>

        <section className="section">
          <div className="container">
            <div className="panel cms-panel">
              <div>
                <p className="panel-eyebrow">No-code CMS workflow</p>
                <h2 className="section-title">{content.noCodeCms.headline}</h2>
                <p className="muted">{content.noCodeCms.description}</p>
                <a className="btn btn-ghost" href={content.noCodeCms.ctaUrl}>
                  {content.noCodeCms.ctaLabel}
                </a>
              </div>
              <ul className="list cms-list">
                {content.noCodeCms.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">What users say</h2>
            <div className="three-grid">
              {content.testimonials.map((testimonial) => (
                <article key={testimonial.quote} className="panel testimonial-item">
                  <p className="quote">&ldquo;{testimonial.quote}&rdquo;</p>
                  <strong>{testimonial.name}</strong>
                  <p className="muted">{testimonial.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">FAQs</h2>
            <div className="three-grid">
              {content.faqs.map((faq) => (
                <article key={faq.question} className="panel faq-item">
                  <strong>{faq.question}</strong>
                  <p className="muted">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner container">
          <p>{content.seo.title}</p>
          <p className="muted">{content.seo.description}</p>
          <div className="footer-actions">
            <Link href="/studio" className="btn btn-ghost">
              Edit marketing content
            </Link>
            <a href={content.dashboardUrl} className="btn btn-primary">
              Open Boopy app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
