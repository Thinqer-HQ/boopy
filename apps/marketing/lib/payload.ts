export type MarketingContent = {
  seo: {
    title: string;
    description: string;
    imageUrl: string | null;
  };
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
    title: "Boopy - Subscription Renewal Command Center",
    description:
      "Track recurring subscriptions, monitor renewal dates, and automate reminders for agencies and teams.",
    imageUrl: null,
  },
  heroBadge: "Built for aggressive SaaS growth",
  heroTitle: "Track subscriptions, stop surprise charges, and keep renewals under control.",
  heroSubtitle:
    "Boopy gives founders and agencies one source of truth for recurring spend, renewal calendars, and multi-channel reminders.",
  primaryCta: {
    label: "Start with Boopy",
    url: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  },
  secondaryCta: {
    label: "View pricing",
    url: `${(process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login").replace(/\/login$/, "")}/settings/billing`,
  },
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  features: [
    {
      title: "Centralized workspace tracking",
      description:
        "Organize subscriptions by group and client, with shared visibility for operators and finance.",
    },
    {
      title: "Renewal calendar and reminders",
      description:
        "Get renewal visibility across email, push, and external destinations before deadlines hit.",
    },
    {
      title: "Invoice document ingestion",
      description:
        "Upload invoices and receipts, extract candidates, and confirm before creating subscription records.",
    },
  ],
  testimonials: [
    {
      quote:
        "Boopy replaced our ad-hoc spreadsheets and gave our ops team renewal visibility we can trust.",
      name: "A. Rivera",
      role: "Agency operator",
    },
    {
      quote:
        "Our finance and ops finally have one place to coordinate recurring spend and due dates.",
      name: "K. Morgan",
      role: "SaaS founder",
    },
  ],
  faqs: [
    {
      question: "Can I manage multiple clients in one workspace?",
      answer:
        "Yes. Boopy supports grouped subscription tracking so agencies can manage client subscriptions in one dashboard.",
    },
    {
      question: "Can we start free and upgrade later?",
      answer:
        "Yes. Start on Free, then upgrade to Pro when you need batch document processing and higher operational limits.",
    },
  ],
  pricing: {
    free: {
      label: "Free",
      price: "$0",
      description: "Ideal for solo founders validating renewal workflows.",
      features: ["Single document upload", "Basic renewal tracking", "Personal workspace setup"],
      ctaLabel: "Get started",
    },
    pro: {
      label: "Pro",
      price: "$29",
      description: "For teams that need operational scale and automation.",
      features: [
        "Batch document processing",
        "Push + external channel automation",
        "Advanced reports and integrations",
      ],
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
