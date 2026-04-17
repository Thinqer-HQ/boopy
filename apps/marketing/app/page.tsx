import { getMarketingContent } from "@/lib/payload";

export default async function MarketingHomePage() {
  const content = await getMarketingContent();

  return (
    <div className="site-shell theme-mono">
      <div className="bg-grid" />
      <header className="header">
        <div className="header-inner container">
          <div className="brand-wrap">
            <div className="brand-pill brand-pill-fill">Boopy</div>
            <span className="brand-copy">{content.brandStatement}</span>
          </div>
          <nav className="nav-actions">
            <a href="#audiences" className="btn btn-ghost">
              Use Cases
            </a>
            <a href="#pricing" className="btn btn-ghost">
              Pricing
            </a>
            <a href={content.dashboardUrl} className="btn btn-primary">
              Open app
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section reveal-up">
          <div className="hero-grid container">
            <div className="hero-copy">
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
              <div className="hero-microproof">
                {content.socialProof.map((item) => (
                  <div key={`hero-proof-${item.label}`} className="micro-pill">
                    <span className="dot" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel hero-visual">
              <p className="panel-eyebrow">At a glance</p>
              <div className="stack stack-tight">
                {content.features.map((feature) => (
                  <div key={feature.title} className="mini-card mini-card-animated">
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
              <div className="visual-orb" />
            </div>
          </div>
        </section>

        <section className="section reveal-up">
          <div className="ticker-wrap">
            <div className="ticker">
              <span>PERSONAL</span>
              <span>GROUPS</span>
              <span>AGENCIES</span>
              <span>BUSINESSES</span>
              <span>OPERATIONS TEAMS</span>
              <span>PERSONAL</span>
              <span>GROUPS</span>
              <span>AGENCIES</span>
              <span>BUSINESSES</span>
            </div>
          </div>
        </section>

        <section className="section reveal-up">
          <div className="container">
            <div className="social-proof-grid">
              {content.socialProof.map((item, index) => (
                <article
                  key={item.label}
                  className="panel social-proof-item stagger-up"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <p className="metric">{item.value}</p>
                  <p className="muted">{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="audiences" className="section reveal-up">
          <div className="container">
            <h2 className="section-title">{content.audienceHeadline}</h2>
            <div className="audience-grid">
              {content.audiences.map((audience, index) => (
                <article
                  key={audience.title}
                  className="panel audience-item stagger-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <strong>{audience.title}</strong>
                  <p className="muted">{audience.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal-up">
          <div className="container">
            <h2 className="section-title">{content.valueHeadline}</h2>
            <div className="three-grid">
              {content.valuePillars.map((pillar, index) => (
                <article
                  key={pillar.title}
                  className="panel value-item stagger-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <strong>{pillar.title}</strong>
                  <p className="muted">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section reveal-up">
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

        <section className="section reveal-up">
          <div className="container">
            <h2 className="section-title">What people say</h2>
            <div className="three-grid">
              {content.testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.quote}
                  className="panel testimonial-item stagger-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="quote">&ldquo;{testimonial.quote}&rdquo;</p>
                  <strong>{testimonial.name}</strong>
                  <p className="muted">{testimonial.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section reveal-up">
          <div className="container">
            <h2 className="section-title">Quick answers</h2>
            <div className="three-grid">
              {content.faqs.map((faq, index) => (
                <article
                  key={faq.question}
                  className="panel faq-item stagger-up"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
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
            <a href={content.dashboardUrl} className="btn btn-primary">
              Open Boopy app
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
