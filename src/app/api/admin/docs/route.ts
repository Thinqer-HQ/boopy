export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const specUrl = `${baseUrl}/api/admin/openapi.json`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boopy Admin API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0f0f13; }
    .swagger-ui { background: #0f0f13; }
    .swagger-ui .topbar { background: #1a1a24; border-bottom: 1px solid #2a2a3a; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; gap: 8px; }
    .swagger-ui .topbar-wrapper .link::before {
      content: "🟣 Boopy Admin API";
      color: #b8aeff;
      font-weight: 700;
      font-size: 16px;
      font-family: system-ui, sans-serif;
    }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .info .title { color: #b8aeff; }
    .swagger-ui .scheme-container { background: #1a1a24; padding: 12px 20px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "${specUrl}",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      deepLinking: true,
      tryItOutEnabled: true,
      persistAuthorization: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
