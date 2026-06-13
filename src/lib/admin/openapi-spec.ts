/**
 * OpenAPI 3.1 spec for the Boopy Admin API.
 * Served at GET /api/admin/openapi.json — auto-rebuilds on every deploy.
 *
 * Authentication: pass your BOOPY_ADMIN_SECRET as:
 *   Header: x-admin-secret: <secret>
 *   OR Bearer: Authorization: Bearer <secret>
 */
export const ADMIN_OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Boopy Admin API",
    version: "1.0.0",
    description:
      "Internal admin API for tracking users, plans, billing, and aggregate business metrics. Protected by `BOOPY_ADMIN_SECRET`. **Never expose this secret publicly.**",
    contact: { name: "Boopy Team", url: "https://www.useboopy.com" },
  },
  servers: [
    { url: "https://app.useboopy.com", description: "Production" },
    { url: "http://localhost:3000", description: "Local development" },
  ],
  security: [{ AdminSecret: [] }, { BearerToken: [] }],
  components: {
    securitySchemes: {
      AdminSecret: {
        type: "apiKey",
        in: "header",
        name: "x-admin-secret",
        description: "Value of `BOOPY_ADMIN_SECRET` environment variable",
      },
      BearerToken: {
        type: "http",
        scheme: "bearer",
        description: "Value of `BOOPY_ADMIN_SECRET` as a Bearer token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
        },
        required: ["error"],
      },
      UserSummary: {
        type: "object",
        description: "Summary of a Boopy user with their workspace and billing info",
        properties: {
          userId: { type: "string", format: "uuid", description: "Supabase auth user ID" },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
            nullable: true,
          },
          workspaceId: {
            type: "string",
            format: "uuid",
            description: "Primary workspace ID",
            nullable: true,
          },
          workspaceName: {
            type: "string",
            description: "Primary workspace name",
            nullable: true,
          },
          plan: {
            type: "string",
            enum: ["free", "pro"],
            description: "Current billing plan",
            nullable: true,
          },
          billingStatus: {
            type: "string",
            description: "Stripe subscription status (active, trialing, canceled, etc.)",
            nullable: true,
          },
          stripeCustomerId: {
            type: "string",
            description: "Stripe customer ID",
            nullable: true,
          },
          stripeSubscriptionId: {
            type: "string",
            description: "Stripe subscription ID",
            nullable: true,
          },
          subscriptionCount: {
            type: "integer",
            description: "Total number of tracked subscriptions",
          },
          activeSubscriptionCount: {
            type: "integer",
            description: "Number of active subscriptions",
          },
          groupCount: {
            type: "integer",
            description: "Number of subscription groups",
          },
          joinedAt: {
            type: "string",
            format: "date-time",
            description: "When the user first joined (UTC)",
            nullable: true,
          },
        },
        required: ["userId", "subscriptionCount", "activeSubscriptionCount", "groupCount"],
      },
      UserDetail: {
        allOf: [
          { $ref: "#/components/schemas/UserSummary" },
          {
            type: "object",
            description: "Full user detail including subscription data",
            properties: {
              subscriptions: {
                type: "array",
                description: "All subscriptions belonging to this user",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    vendorName: { type: "string" },
                    amount: { type: "number" },
                    currency: { type: "string" },
                    cadence: {
                      type: "string",
                      enum: ["monthly", "yearly", "quarterly", "custom"],
                    },
                    status: {
                      type: "string",
                      enum: ["active", "paused", "cancelled"],
                    },
                    groupName: { type: "string", nullable: true },
                    renewalDate: { type: "string", format: "date", nullable: true },
                    createdAt: { type: "string", format: "date-time", nullable: true },
                  },
                  required: ["id", "vendorName", "amount", "currency", "cadence", "status"],
                },
              },
            },
          },
        ],
      },
      Stats: {
        type: "object",
        description: "Aggregated business metrics",
        properties: {
          generatedAt: { type: "string", format: "date-time" },
          users: {
            type: "object",
            properties: {
              total: { type: "integer", description: "Total registered users" },
              pro: { type: "integer", description: "Users on Pro plan" },
              free: { type: "integer", description: "Users on Free plan (or no billing row)" },
              activeTrial: {
                type: "integer",
                description: "Users currently in trial",
              },
            },
            required: ["total", "pro", "free", "activeTrial"],
          },
          workspaces: {
            type: "object",
            properties: {
              total: { type: "integer" },
            },
            required: ["total"],
          },
          subscriptions: {
            type: "object",
            properties: {
              total: { type: "integer" },
              active: { type: "integer" },
            },
            required: ["total", "active"],
          },
        },
        required: ["generatedAt", "users", "workspaces", "subscriptions"],
      },
    },
  },
  paths: {
    "/api/admin/users": {
      get: {
        operationId: "listUsers",
        summary: "List all users",
        description:
          "Returns all registered users with their workspace, billing plan, Stripe IDs, and subscription counts. Sorted by join date descending (newest first).",
        tags: ["Users"],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number (1-based)",
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", default: 50, minimum: 1, maximum: 200 },
            description: "Results per page",
          },
          {
            name: "plan",
            in: "query",
            schema: { type: "string", enum: ["free", "pro"] },
            description: "Filter by plan",
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of users",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserSummary" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        pageSize: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                      required: ["page", "pageSize", "total", "totalPages"],
                    },
                  },
                  required: ["data", "pagination"],
                },
              },
            },
          },
          "403": {
            description: "Forbidden — invalid or missing admin secret",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "503": {
            description: "Admin API not configured",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/admin/users/{userId}": {
      get: {
        operationId: "getUser",
        summary: "Get a single user",
        description: "Returns full detail for one user including all their subscriptions.",
        tags: ["Users"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Supabase auth user ID",
          },
        ],
        responses: {
          "200": {
            description: "User detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDetail" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/admin/stats": {
      get: {
        operationId: "getStats",
        summary: "Get aggregate business metrics",
        description:
          "Returns totals for users by plan, workspaces, and subscriptions. Use as a quick health-check for your business dashboard.",
        tags: ["Metrics"],
        responses: {
          "200": {
            description: "Aggregated metrics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Stats" },
              },
            },
          },
          "403": {
            description: "Forbidden",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/admin/openapi.json": {
      get: {
        operationId: "getOpenApiSpec",
        summary: "OpenAPI spec",
        description: "Returns this OpenAPI 3.1 specification as JSON. No authentication required.",
        tags: ["Meta"],
        security: [],
        responses: {
          "200": {
            description: "OpenAPI spec JSON",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/api/admin/docs": {
      get: {
        operationId: "getDocs",
        summary: "Interactive API docs",
        description:
          "Swagger UI rendered in the browser. No authentication required to view the docs page itself.",
        tags: ["Meta"],
        security: [],
        responses: {
          "200": {
            description: "HTML page with Swagger UI",
            content: { "text/html": { schema: { type: "string" } } },
          },
        },
      },
    },
  },
  tags: [
    { name: "Users", description: "User profile, billing, and subscription data" },
    { name: "Metrics", description: "Aggregate business analytics" },
    { name: "Meta", description: "Documentation and spec endpoints" },
  ],
} as const;
