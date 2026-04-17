import type { GlobalConfig } from "payload";

export const MarketingSiteGlobal: GlobalConfig = {
  slug: "marketing-site",
  label: "Marketing Site",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "imageUrl", type: "text" },
      ],
    },
    { name: "heroBadge", type: "text", required: true },
    { name: "heroTitle", type: "text", required: true },
    { name: "heroSubtitle", type: "textarea", required: true },
    {
      name: "primaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    { name: "dashboardUrl", type: "text", required: true },
    {
      name: "features",
      type: "array",
      minRows: 3,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
      ],
    },
    {
      name: "testimonials",
      type: "array",
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "name", type: "text", required: true },
        { name: "role", type: "text", required: true },
      ],
    },
    {
      name: "faqs",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    {
      name: "pricing",
      type: "group",
      fields: [
        {
          name: "free",
          type: "group",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "price", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
            { name: "features", type: "array", fields: [{ name: "value", type: "text" }] },
            { name: "ctaLabel", type: "text", required: true },
          ],
        },
        {
          name: "pro",
          type: "group",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "price", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
            { name: "features", type: "array", fields: [{ name: "value", type: "text" }] },
            { name: "ctaLabel", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
