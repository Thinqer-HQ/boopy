module.exports = [
  71306,
  (a, b, c) => {
    b.exports = a.r(18622);
  },
  79847,
  (a) => {
    a.n(a.i(3343));
  },
  9185,
  (a) => {
    a.n(a.i(29432));
  },
  72842,
  (a) => {
    a.n(a.i(75164));
  },
  54897,
  (a) => {
    a.n(a.i(30106));
  },
  56157,
  (a) => {
    a.n(a.i(18970));
  },
  94331,
  (a) => {
    a.n(a.i(60644));
  },
  15988,
  (a) => {
    a.n(a.i(56952));
  },
  25766,
  (a) => {
    a.n(a.i(77341));
  },
  29725,
  (a) => {
    a.n(a.i(94290));
  },
  5785,
  (a) => {
    a.n(a.i(90588));
  },
  74793,
  (a) => {
    a.n(a.i(33169));
  },
  85826,
  (a) => {
    a.n(a.i(37111));
  },
  21565,
  (a) => {
    a.n(a.i(41763));
  },
  65911,
  (a) => {
    a.n(a.i(8950));
  },
  25128,
  (a) => {
    a.n(a.i(91562));
  },
  40781,
  (a) => {
    a.n(a.i(49670));
  },
  69411,
  (a) => {
    a.n(a.i(75700));
  },
  63081,
  (a) => {
    a.n(a.i(276));
  },
  62837,
  (a) => {
    a.n(a.i(40795));
  },
  34607,
  (a) => {
    a.n(a.i(11614));
  },
  96338,
  (a) => {
    a.n(a.i(21751));
  },
  50642,
  (a) => {
    a.n(a.i(12213));
  },
  32242,
  (a) => {
    a.n(a.i(22693));
  },
  88530,
  (a) => {
    a.n(a.i(10531));
  },
  93695,
  (a, b, c) => {
    b.exports = a.x("next/dist/shared/lib/no-fallback-error.external.js", () =>
      require("next/dist/shared/lib/no-fallback-error.external.js")
    );
  },
  8583,
  (a) => {
    a.n(a.i(1082));
  },
  38534,
  (a) => {
    a.n(a.i(98175));
  },
  70408,
  (a) => {
    a.n(a.i(9095));
  },
  22922,
  (a) => {
    a.n(a.i(96772));
  },
  78294,
  (a) => {
    a.n(a.i(71717));
  },
  16625,
  (a) => {
    a.n(a.i(85034));
  },
  88648,
  (a) => {
    a.n(a.i(68113));
  },
  51914,
  (a) => {
    a.n(a.i(66482));
  },
  25466,
  (a) => {
    a.n(a.i(91505));
  },
  64240,
  (a, b, c) => {
    "use strict";
    function d(a) {
      if ("function" != typeof WeakMap) return null;
      var b = new WeakMap(),
        c = new WeakMap();
      return (d = function (a) {
        return a ? c : b;
      })(a);
    }
    c._ = function (a, b) {
      if (!b && a && a.__esModule) return a;
      if (null === a || ("object" != typeof a && "function" != typeof a)) return { default: a };
      var c = d(b);
      if (c && c.has(a)) return c.get(a);
      var e = { __proto__: null },
        f = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var g in a)
        if ("default" !== g && Object.prototype.hasOwnProperty.call(a, g)) {
          var h = f ? Object.getOwnPropertyDescriptor(a, g) : null;
          h && (h.get || h.set) ? Object.defineProperty(e, g, h) : (e[g] = a[g]);
        }
      return ((e.default = a), c && c.set(a, e), e);
    };
  },
  790,
  (a, b, c) => {
    let { createClientModuleProxy: d } = a.r(11857);
    a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js <module evaluation>"));
  },
  84707,
  (a, b, c) => {
    let { createClientModuleProxy: d } = a.r(11857);
    a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js"));
  },
  97647,
  (a) => {
    "use strict";
    a.i(790);
    var b = a.i(84707);
    a.n(b);
  },
  95936,
  (a, b, c) => {
    "use strict";
    Object.defineProperty(c, "__esModule", { value: !0 });
    var d = {
      default: function () {
        return i;
      },
      useLinkStatus: function () {
        return h.useLinkStatus;
      },
    };
    for (var e in d) Object.defineProperty(c, e, { enumerable: !0, get: d[e] });
    let f = a.r(64240),
      g = a.r(7997),
      h = f._(a.r(97647));
    function i(a) {
      let b = a.legacyBehavior,
        c =
          "string" == typeof a.children ||
          "number" == typeof a.children ||
          "string" == typeof a.children?.type,
        d = a.children?.type?.$$typeof === Symbol.for("react.client.reference");
      return (
        !b ||
          c ||
          d ||
          (a.children?.type?.$$typeof === Symbol.for("react.lazy")
            ? console.error(
                "Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."
              )
            : console.error(
                "Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag."
              )),
        (0, g.jsx)(h.default, { ...a })
      );
    }
    ("function" == typeof c.default || ("object" == typeof c.default && null !== c.default)) &&
      void 0 === c.default.__esModule &&
      (Object.defineProperty(c.default, "__esModule", { value: !0 }),
      Object.assign(c.default, c),
      (b.exports = c.default));
  },
  31081,
  (a) => {
    "use strict";
    var b = a.i(7997),
      c = a.i(95936);
    let d = {
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
          features: [
            "Single document upload",
            "Basic renewal tracking",
            "Personal workspace setup",
          ],
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
    function e(a, b) {
      let c =
        a?.map((a) => ("string" == typeof a ? a.trim() : a.value?.trim() || "")).filter(Boolean) ??
        [];
      return c.length > 0 ? c : b;
    }
    async function f() {
      let a = process.env.PAYLOAD_API_URL?.trim(),
        b = process.env.PAYLOAD_API_TOKEN?.trim();
      if (!a) return d;
      try {
        let c = await fetch(`${a.replace(/\/$/, "")}/api/globals/marketing-site`, {
          headers: b ? { Authorization: `JWT ${b}` } : void 0,
          cache: "no-store",
        });
        if (!c.ok) return d;
        let f = await c.json();
        return {
          seo: {
            title: f.seo?.title?.trim() || d.seo.title,
            description: f.seo?.description?.trim() || d.seo.description,
            imageUrl: f.seo?.imageUrl?.trim() || d.seo.imageUrl,
          },
          heroBadge: f.heroBadge?.trim() || d.heroBadge,
          heroTitle: f.heroTitle?.trim() || d.heroTitle,
          heroSubtitle: f.heroSubtitle?.trim() || d.heroSubtitle,
          primaryCta: {
            label: f.primaryCta?.label?.trim() || d.primaryCta.label,
            url: f.primaryCta?.url?.trim() || d.primaryCta.url,
          },
          secondaryCta: {
            label: f.secondaryCta?.label?.trim() || d.secondaryCta.label,
            url: f.secondaryCta?.url?.trim() || d.secondaryCta.url,
          },
          dashboardUrl: f.dashboardUrl?.trim() || d.dashboardUrl,
          features:
            f.features
              ?.map((a) => ({
                title: a.title?.trim() || "",
                description: a.description?.trim() || "",
              }))
              .filter((a) => a.title && a.description) || d.features,
          testimonials:
            f.testimonials
              ?.map((a) => ({
                quote: a.quote?.trim() || "",
                name: a.name?.trim() || "",
                role: a.role?.trim() || "",
              }))
              .filter((a) => a.quote && a.name) || d.testimonials,
          faqs:
            f.faqs
              ?.map((a) => ({ question: a.question?.trim() || "", answer: a.answer?.trim() || "" }))
              .filter((a) => a.question && a.answer) || d.faqs,
          pricing: {
            free: {
              label: f.pricing?.free?.label?.trim() || d.pricing.free.label,
              price: f.pricing?.free?.price?.trim() || d.pricing.free.price,
              description: f.pricing?.free?.description?.trim() || d.pricing.free.description,
              features: e(f.pricing?.free?.features, d.pricing.free.features),
              ctaLabel: f.pricing?.free?.ctaLabel?.trim() || d.pricing.free.ctaLabel,
            },
            pro: {
              label: f.pricing?.pro?.label?.trim() || d.pricing.pro.label,
              price: f.pricing?.pro?.price?.trim() || d.pricing.pro.price,
              description: f.pricing?.pro?.description?.trim() || d.pricing.pro.description,
              features: e(f.pricing?.pro?.features, d.pricing.pro.features),
              ctaLabel: f.pricing?.pro?.ctaLabel?.trim() || d.pricing.pro.ctaLabel,
            },
          },
        };
      } catch {
        return d;
      }
    }
    async function g() {
      let a = await f();
      return (0, b.jsxs)(b.Fragment, {
        children: [
          (0, b.jsx)("header", {
            className: "topbar",
            children: (0, b.jsxs)("div", {
              className: "container topbar-inner",
              children: [
                (0, b.jsx)("div", { className: "brand", children: "Boopy" }),
                (0, b.jsxs)("div", {
                  className: "nav-actions",
                  children: [
                    (0, b.jsx)(c.default, {
                      href: "/studio",
                      className: "btn btn-outline",
                      children: "Open Puck editor",
                    }),
                    (0, b.jsx)("a", {
                      href: a.dashboardUrl,
                      className: "btn btn-primary",
                      children: "Open dashboard",
                    }),
                  ],
                }),
              ],
            }),
          }),
          (0, b.jsxs)("main", {
            children: [
              (0, b.jsx)("section", {
                className: "hero",
                children: (0, b.jsxs)("div", {
                  className: "container hero-grid",
                  children: [
                    (0, b.jsxs)("div", {
                      children: [
                        (0, b.jsx)("span", { className: "pill", children: a.heroBadge }),
                        (0, b.jsx)("h1", { className: "title", children: a.heroTitle }),
                        (0, b.jsx)("p", { className: "subtitle", children: a.heroSubtitle }),
                        (0, b.jsxs)("div", {
                          className: "hero-cta",
                          children: [
                            (0, b.jsx)("a", {
                              href: a.primaryCta.url,
                              className: "btn btn-primary",
                              children: a.primaryCta.label,
                            }),
                            (0, b.jsx)("a", {
                              href: a.secondaryCta.url,
                              className: "btn btn-outline",
                              children: a.secondaryCta.label,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, b.jsxs)("div", {
                      className: "stats",
                      children: [
                        (0, b.jsxs)("div", {
                          className: "card",
                          children: [
                            (0, b.jsx)("strong", { children: a.seo.title }),
                            (0, b.jsx)("p", { className: "subtitle", children: a.seo.description }),
                          ],
                        }),
                        (0, b.jsxs)("div", {
                          className: "card",
                          children: [
                            (0, b.jsx)("strong", { children: "Built for founders and agencies" }),
                            (0, b.jsx)("p", {
                              className: "subtitle",
                              children:
                                "Track internal tools and client subscriptions with a shared workflow.",
                            }),
                          ],
                        }),
                        (0, b.jsxs)("div", {
                          className: "card",
                          children: [
                            (0, b.jsx)("strong", { children: "Operate with confidence" }),
                            (0, b.jsx)("p", {
                              className: "subtitle",
                              children:
                                "Avoid missed renewals and late reactions through structured reminders and reports.",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, b.jsx)("section", {
                className: "section",
                children: (0, b.jsxs)("div", {
                  className: "container",
                  children: [
                    (0, b.jsx)("h2", { children: "Why teams switch to Boopy" }),
                    (0, b.jsx)("div", {
                      className: "feature-grid",
                      children: a.features.map((a) =>
                        (0, b.jsxs)(
                          "div",
                          {
                            className: "card feature-item",
                            children: [
                              (0, b.jsx)("strong", { children: a.title }),
                              (0, b.jsx)("p", { children: a.description }),
                            ],
                          },
                          a.title
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, b.jsx)("section", {
                className: "section",
                children: (0, b.jsxs)("div", {
                  className: "container",
                  children: [
                    (0, b.jsx)("h2", { children: "Simple pricing that scales with you" }),
                    (0, b.jsxs)("div", {
                      className: "pricing-grid",
                      children: [
                        (0, b.jsxs)("div", {
                          className: "card",
                          children: [
                            (0, b.jsx)("strong", { children: a.pricing.free.label }),
                            (0, b.jsx)("p", { className: "price", children: a.pricing.free.price }),
                            (0, b.jsx)("p", {
                              className: "subtitle",
                              children: a.pricing.free.description,
                            }),
                            (0, b.jsx)("ul", {
                              className: "list",
                              children: a.pricing.free.features.map((a) =>
                                (0, b.jsx)("li", { children: a }, `free-${a}`)
                              ),
                            }),
                            (0, b.jsx)("a", {
                              className: "btn btn-outline",
                              href: a.dashboardUrl,
                              children: a.pricing.free.ctaLabel,
                            }),
                          ],
                        }),
                        (0, b.jsxs)("div", {
                          className: "card",
                          children: [
                            (0, b.jsx)("strong", { children: a.pricing.pro.label }),
                            (0, b.jsxs)("p", {
                              className: "price",
                              children: [
                                a.pricing.pro.price,
                                (0, b.jsx)("span", {
                                  style: { fontSize: "0.9rem", color: "var(--muted)" },
                                  children: "/mo",
                                }),
                              ],
                            }),
                            (0, b.jsx)("p", {
                              className: "subtitle",
                              children: a.pricing.pro.description,
                            }),
                            (0, b.jsx)("ul", {
                              className: "list",
                              children: a.pricing.pro.features.map((a) =>
                                (0, b.jsx)("li", { children: a }, `pro-${a}`)
                              ),
                            }),
                            (0, b.jsx)("a", {
                              className: "btn btn-primary",
                              href: `${a.dashboardUrl.replace("/login", "")}/settings/billing`,
                              children: a.pricing.pro.ctaLabel,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, b.jsx)("section", {
                className: "section",
                children: (0, b.jsxs)("div", {
                  className: "container",
                  children: [
                    (0, b.jsx)("h2", { children: "What operators say" }),
                    (0, b.jsx)("div", {
                      className: "feature-grid",
                      children: a.testimonials.map((a) =>
                        (0, b.jsxs)(
                          "div",
                          {
                            className: "card",
                            children: [
                              (0, b.jsxs)("p", {
                                className: "subtitle",
                                style: { marginTop: 0 },
                                children: ["“", a.quote, "”"],
                              }),
                              (0, b.jsx)("strong", { children: a.name }),
                              (0, b.jsx)("p", {
                                className: "subtitle",
                                style: { margin: "0.2rem 0 0" },
                                children: a.role,
                              }),
                            ],
                          },
                          a.quote
                        )
                      ),
                    }),
                  ],
                }),
              }),
              (0, b.jsx)("section", {
                className: "section",
                children: (0, b.jsxs)("div", {
                  className: "container",
                  children: [
                    (0, b.jsx)("h2", { children: "FAQs" }),
                    (0, b.jsx)("div", {
                      className: "feature-grid",
                      children: a.faqs.map((a) =>
                        (0, b.jsxs)(
                          "div",
                          {
                            className: "card",
                            children: [
                              (0, b.jsx)("strong", { children: a.question }),
                              (0, b.jsx)("p", { className: "subtitle", children: a.answer }),
                            ],
                          },
                          a.question
                        )
                      ),
                    }),
                  ],
                }),
              }),
            ],
          }),
          (0, b.jsx)("footer", {
            className: "footer",
            children: (0, b.jsx)("div", {
              className: "container",
              children: "Boopy marketing app • Separate deployment from dashboard app",
            }),
          }),
        ],
      });
    }
    a.s(["default", 0, g], 31081);
  },
  7455,
  (a) => {
    a.n(a.i(31081));
  },
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0gh4v50._.js.map
