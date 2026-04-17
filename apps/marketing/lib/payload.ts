export type MarketingContent = {
  seo: {
    title: string;
    description: string;
    imageUrl: string | null;
  };
  brandStatement: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: {
    label: string;
    url: string;
  };
  secondaryCta: {
    label: string;
    url: string;
  };
  dashboardUrl: string;
  socialProof: Array<{ value: string; label: string }>;
  audienceHeadline: string;
  audiences: Array<{ title: string; description: string }>;
  valueHeadline: string;
  valuePillars: Array<{ title: string; description: string }>;
  noCodeCms: {
    headline: string;
    description: string;
    points: string[];
    ctaLabel: string;
    ctaUrl: string;
  };
  features: Array<{ title: string; description: string }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  pricing: {
    free: {
      label: string;
      price: string;
      description: string;
      features: string[];
      ctaLabel: string;
    };
    pro: {
      label: string;
      price: string;
      description: string;
      features: string[];
      ctaLabel: string;
    };
  };
};

const fallbackContent: MarketingContent = {
  seo: {
    title: "Boopy - The Comprehensive Subscription Manager",
    description:
      "Finally, a subscription manager that works. Track renewals and spending in one simple place.",
    imageUrl: null,
  },
  brandStatement: "For personal, teams, agencies, and businesses.",
  heroBadge: "For everyone",
  heroTitle: "Finally, a subscription manager that works.",
  heroSubtitle:
    "See every subscription. Know what is due. Stop surprise charges. All in one clean dashboard.",
  primaryCta: {
    label: "Start free",
    url: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  },
  secondaryCta: {
    label: "See pricing",
    url: `${(process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login").replace(/\/login$/, "")}/settings/billing`,
  },
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  socialProof: [
    { value: "One place", label: "All subscriptions" },
    { value: "No surprises", label: "Renewal reminders" },
    { value: "Clear spend", label: "Know where money goes" },
  ],
  audienceHeadline: "Made for real life and real teams",
  audiences: [
    {
      title: "Personal",
      description: "Track your own subscriptions and never forget a renewal date.",
    },
    {
      title: "Groups",
      description: "Keep shared subscriptions organized and easy to manage together.",
    },
    {
      title: "Agencies",
      description: "Handle internal tools and client subscriptions in one workspace.",
    },
    {
      title: "Businesses",
      description: "See team spending clearly and stay ahead of every contract renewal.",
    },
  ],
  valueHeadline: "See everything. Miss nothing.",
  valuePillars: [
    {
      title: "Simple tracking",
      description: "Add subscriptions once and find them fast when you need them.",
    },
    {
      title: "Smart reminders",
      description: "Get alerts before renewals so you can act on time.",
    },
    {
      title: "Spend clarity",
      description: "Understand what you pay, where it goes, and what is coming next.",
    },
  ],
  noCodeCms: {
    headline: "Your marketing partner can edit this without code",
    description: "Use Payload to update headlines, sections, CTAs, and pricing in minutes.",
    points: ["Edit copy fast", "Publish changes quickly", "No developer ticket needed"],
    ctaLabel: "Open content studio",
    ctaUrl: "/studio",
  },
  features: [
    {
      title: "Everything in one view",
      description: "No more scattered notes, sheets, or missed details.",
    },
    {
      title: "Never miss a renewal",
      description: "Know what is due and when, before charges hit.",
    },
    {
      title: "Clear spending picture",
      description: "Quickly understand your recurring costs.",
    },
  ],
  testimonials: [
    {
      quote: "This is the first subscription tool that just makes sense.",
      name: "Jamie R.",
      role: "Agency owner",
    },
    {
      quote: "I can finally see every renewal without digging through old notes.",
      name: "Ari P.",
      role: "Founder",
    },
  ],
  faqs: [
    {
      question: "Who is Boopy for?",
      answer: "Anyone. Personal users, groups, agencies, and businesses.",
    },
    {
      question: "Can non-technical teammates edit this page?",
      answer: "Yes. Use Payload CMS to update content without code.",
    },
  ],
  pricing: {
    free: {
      label: "Free",
      price: "$0",
      description: "Great for getting started.",
      features: ["Track subscriptions", "See renewals", "Personal workspace"],
      ctaLabel: "Get started",
    },
    pro: {
      label: "Pro",
      price: "$29",
      description: "For teams that want more power.",
      features: ["Higher limits", "Collaboration", "Advanced reports"],
      ctaLabel: "Upgrade to Pro",
    },
  },
};

type PayloadGlobalResponse = {
  seo?: {
    title?: string;
    description?: string;
    imageUrl?: string | null;
  };
  brandStatement?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  primaryCta?: {
    label?: string;
    url?: string;
  };
  secondaryCta?: {
    label?: string;
    url?: string;
  };
  dashboardUrl?: string;
  socialProof?: Array<{ value?: string; label?: string }>;
  audienceHeadline?: string;
  audiences?: Array<{ title?: string; description?: string }>;
  valueHeadline?: string;
  valuePillars?: Array<{ title?: string; description?: string }>;
  noCodeCms?: {
    headline?: string;
    description?: string;
    points?: Array<string | { value?: string }>;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  features?: Array<{ title?: string; description?: string }>;
  testimonials?: Array<{
    quote?: string;
    name?: string;
    role?: string;
  }>;
  faqs?: Array<{
    question?: string;
    answer?: string;
  }>;
  pricing?: {
    free?: {
      label?: string;
      price?: string;
      description?: string;
      features?: Array<string | { value?: string }>;
      ctaLabel?: string;
    };
    pro?: {
      label?: string;
      price?: string;
      description?: string;
      features?: Array<string | { value?: string }>;
      ctaLabel?: string;
    };
  };
};

function normalizeFeatureList(
  values: Array<string | { value?: string }> | undefined,
  fallback: string[]
) {
  const normalized =
    values
      ?.map((value) => {
        if (typeof value === "string") return value.trim();
        return value.value?.trim() || "";
      })
      .filter(Boolean) ?? [];
  return normalized.length > 0 ? normalized : fallback;
}

export async function getMarketingContent(): Promise<MarketingContent> {
  const payloadUrl = process.env.PAYLOAD_API_URL?.trim();
  const payloadToken = process.env.PAYLOAD_API_TOKEN?.trim();
  if (!payloadUrl) return fallbackContent;

  try {
    const response = await fetch(`${payloadUrl.replace(/\/$/, "")}/api/globals/marketing-site`, {
      headers: payloadToken ? { Authorization: `JWT ${payloadToken}` } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return fallbackContent;
    const data = (await response.json()) as PayloadGlobalResponse;
    return {
      seo: {
        title: data.seo?.title?.trim() || fallbackContent.seo.title,
        description: data.seo?.description?.trim() || fallbackContent.seo.description,
        imageUrl: data.seo?.imageUrl?.trim() || fallbackContent.seo.imageUrl,
      },
      brandStatement: data.brandStatement?.trim() || fallbackContent.brandStatement,
      heroBadge: data.heroBadge?.trim() || fallbackContent.heroBadge,
      heroTitle: data.heroTitle?.trim() || fallbackContent.heroTitle,
      heroSubtitle: data.heroSubtitle?.trim() || fallbackContent.heroSubtitle,
      primaryCta: {
        label: data.primaryCta?.label?.trim() || fallbackContent.primaryCta.label,
        url: data.primaryCta?.url?.trim() || fallbackContent.primaryCta.url,
      },
      secondaryCta: {
        label: data.secondaryCta?.label?.trim() || fallbackContent.secondaryCta.label,
        url: data.secondaryCta?.url?.trim() || fallbackContent.secondaryCta.url,
      },
      dashboardUrl: data.dashboardUrl?.trim() || fallbackContent.dashboardUrl,
      socialProof:
        data.socialProof
          ?.map((item) => ({
            value: item.value?.trim() || "",
            label: item.label?.trim() || "",
          }))
          .filter((item) => item.value && item.label) || fallbackContent.socialProof,
      audienceHeadline: data.audienceHeadline?.trim() || fallbackContent.audienceHeadline,
      audiences:
        data.audiences
          ?.map((item) => ({
            title: item.title?.trim() || "",
            description: item.description?.trim() || "",
          }))
          .filter((item) => item.title && item.description) || fallbackContent.audiences,
      valueHeadline: data.valueHeadline?.trim() || fallbackContent.valueHeadline,
      valuePillars:
        data.valuePillars
          ?.map((item) => ({
            title: item.title?.trim() || "",
            description: item.description?.trim() || "",
          }))
          .filter((item) => item.title && item.description) || fallbackContent.valuePillars,
      noCodeCms: {
        headline: data.noCodeCms?.headline?.trim() || fallbackContent.noCodeCms.headline,
        description: data.noCodeCms?.description?.trim() || fallbackContent.noCodeCms.description,
        points: normalizeFeatureList(data.noCodeCms?.points, fallbackContent.noCodeCms.points),
        ctaLabel: data.noCodeCms?.ctaLabel?.trim() || fallbackContent.noCodeCms.ctaLabel,
        ctaUrl: data.noCodeCms?.ctaUrl?.trim() || fallbackContent.noCodeCms.ctaUrl,
      },
      features:
        data.features
          ?.map((feature) => ({
            title: feature.title?.trim() || "",
            description: feature.description?.trim() || "",
          }))
          .filter((feature) => feature.title && feature.description) || fallbackContent.features,
      testimonials:
        data.testimonials
          ?.map((testimonial) => ({
            quote: testimonial.quote?.trim() || "",
            name: testimonial.name?.trim() || "",
            role: testimonial.role?.trim() || "",
          }))
          .filter((testimonial) => testimonial.quote && testimonial.name) ||
        fallbackContent.testimonials,
      faqs:
        data.faqs
          ?.map((faq) => ({
            question: faq.question?.trim() || "",
            answer: faq.answer?.trim() || "",
          }))
          .filter((faq) => faq.question && faq.answer) || fallbackContent.faqs,
      pricing: {
        free: {
          label: data.pricing?.free?.label?.trim() || fallbackContent.pricing.free.label,
          price: data.pricing?.free?.price?.trim() || fallbackContent.pricing.free.price,
          description:
            data.pricing?.free?.description?.trim() || fallbackContent.pricing.free.description,
          features: normalizeFeatureList(
            data.pricing?.free?.features,
            fallbackContent.pricing.free.features
          ),
          ctaLabel: data.pricing?.free?.ctaLabel?.trim() || fallbackContent.pricing.free.ctaLabel,
        },
        pro: {
          label: data.pricing?.pro?.label?.trim() || fallbackContent.pricing.pro.label,
          price: data.pricing?.pro?.price?.trim() || fallbackContent.pricing.pro.price,
          description:
            data.pricing?.pro?.description?.trim() || fallbackContent.pricing.pro.description,
          features: normalizeFeatureList(
            data.pricing?.pro?.features,
            fallbackContent.pricing.pro.features
          ),
          ctaLabel: data.pricing?.pro?.ctaLabel?.trim() || fallbackContent.pricing.pro.ctaLabel,
        },
      },
    };
  } catch {
    return fallbackContent;
  }
}
