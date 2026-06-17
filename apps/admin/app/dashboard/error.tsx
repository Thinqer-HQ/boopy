"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[boopy-admin] dashboard error:", error.message, error.stack);
  }, [error]);

  return (
    <div className="page-body" style={{ padding: "2rem" }}>
      <div
        className="card"
        style={{ borderColor: "var(--red, #e53e3e)", maxWidth: 560, margin: "0 auto" }}
      >
        <div
          className="card-title"
          style={{ color: "var(--red, #e53e3e)", marginBottom: "0.5rem" }}
        >
          Failed to load data
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--muted, #888)", marginBottom: "1rem" }}>
          The admin API returned an error. Check that <code>BOOPY_API_URL</code> and{" "}
          <code>BOOPY_ADMIN_SECRET</code> are correctly set in Vercel environment variables.
        </p>
        <pre
          style={{
            background: "#111",
            color: "#f87171",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            fontSize: "0.78rem",
            overflowX: "auto",
            marginBottom: "1.25rem",
          }}
        >
          {error.message}
        </pre>
        <button
          className="btn-primary"
          onClick={reset}
          style={{
            background: "var(--brand, #6d5df6)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.6rem 1.2rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
