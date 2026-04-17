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
      "Boopy helps anyone track subscriptions, renewal dates, and spending with one clean command center for personal, teams, agencies, and business use.",
    imageUrl: null,
  },
  brandStatement: "One subscription manager for everyone.",
  heroBadge: "Comprehensive subscription management",
  heroTitle: "Track every recurring expense with clarity, control, and zero spreadsheet chaos.",
  heroSubtitle:
    "Boopy is built for personal use, group use, agency operations, and business finance teams. Add subscriptions, monitor renewals, automate reminders, and understand spend across the whole stack.",
  primaryCta: {
    label: "Start free",
    url: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  },
  secondaryCta: {
    label: "See live demo",
    url: `${(process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login").replace(/\/login$/, "")}/settings/billing`,
  },
  dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.boopy.dev/login",
  socialProof: [
    { value: "Personal to Enterprise", label: "Use-case coverage" },
    { value: "Multi-workspace", label: "Groups, clients, agencies" },
    { value: "Alerts + Reports", label: "Actionable visibility" },
  ],
  audienceHeadline: "Built for every subscription operator",
  audiences: [
    {
      title: "Personal users",
      description:
        "Track streaming, SaaS, utilities, and annual renewals in one place so nothing slips.",
    },
    {
      title: "Families and groups",
      description:
        "Organize shared subscriptions per group with clearer ownership and predictable costs.",
    },
    {
      title: "Agencies",
      description:
        "Manage internal tools and client subscriptions side-by-side with cleaner accountability.",
    },
    {
      title: "Businesses",
      description:
        "Gain finance-ready renewal tracking and spend summaries across teams and workspaces.",
    },
  ],
  valueHeadline: "Move from messy tracking to confident operations",
  valuePillars: [
    {
      title: "Comprehensive subscription records",
      description:
        "Keep each subscription's vendor, amount, cadence, currency, and renewal metadata in one normalized place.",
    },
    {
      title: "Renewal calendar and proactive alerts",
      description:
        "Catch renewals before charges hit with reminders and calendar-first visibility across your stack.",
    },
    {
      title: "Documents and reporting that scale",
      description:
        "Turn invoices and receipts into structured records and export clean reports for stakeholders.",
    },
  ],
  noCodeCms: {
    headline: "No-code content editing for your marketing partner",
    description:
      "Use Payload as the content hub and edit this landing page without developer tickets. Update copy, proof, CTAs, FAQs, and pricing in minutes.",
    points: [
      "Payload global model controls all major landing sections",
      "Safe fallback content keeps site live if CMS is unreachable",
      "Visual studio route supports fast block experiments",
    ],
    ctaLabel: "Open content studio",
    ctaUrl: "/studio",
  },
  features: [
    {
      title: "Unified dashboard",
      description:
        "Stop jumping between docs and sheets. One surface for all subscription records and statuses.",
    },
    {
      title: "Renewal intelligence",
      description:
        "See upcoming renewals, avoid accidental charges, and schedule action before deadlines.",
    },
    {
      title: "Operational reports",
      description:
        "Export clear summaries for personal budgeting, team planning, and business finance reviews.",
    },
  ],
  testimonials: [
    {
      quote:
        "Boopy replaced five disconnected tracking docs and instantly made renewal planning easier.",
      name: "N. Patel",
      role: "Operations Lead",
    },
    {
      quote:
        "From personal subscriptions to client tooling, we finally have one reliable source of truth.",
      name: "M. Santos",
      role: "Founder",
    },
  ],
  faqs: [
    {
      question: "Is Boopy only for agencies?",
      answer:
        "No. Boopy is for anyone: personal users, groups, agencies, and businesses. It scales with how you organize subscriptions.",
    },
    {
      question: "Can my marketing partner edit this landing page without code?",
      answer:
        "Yes. Payload is used as a no-code CMS so non-technical collaborators can update messaging, sections, and CTAs quickly.",
    },
  ],
  pricing: {
    free: {
      label: "Free",
      price: "$0",
      description:
        "Perfect for personal use or early-stage teams starting organized subscription tracking.",
      features: ["Core tracking", "Renewal visibility", "Personal or workspace setup"],
      ctaLabel: "Get started",
    },
    pro: {
      label: "Pro",
      price: "$29",
      description:
        "For agencies and businesses that need scale, collaboration, and deeper automation.",
      features: [
        "Higher limits and advanced workflows",
        "Batch document processing and collaboration",
        "Expanded reporting and integration paths",
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
