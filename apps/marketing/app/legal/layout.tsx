import type { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--surface, #f5f4fa)" }}>
      <header
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          background: "#fff",
          padding: "0.875rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-fredoka, Fredoka, sans-serif)",
            fontSize: "1.35rem",
            fontWeight: 600,
            color: "#6d5df6",
            textDecoration: "none",
          }}
        >
          Boopy
        </Link>
        <Link
          href="/"
          style={{
            fontSize: "0.875rem",
            color: "#56516b",
            textDecoration: "none",
          }}
        >
          ← Back to home
        </Link>
      </header>

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        {children}
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "1.5rem",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "#888",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
          <Link href="/privacy" style={{ color: "#888", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: "#888", textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link href="/refund" style={{ color: "#888", textDecoration: "none" }}>
            Refund Policy
          </Link>
          <Link href="/cookies" style={{ color: "#888", textDecoration: "none" }}>
            Cookie Policy
          </Link>
        </div>
        © {new Date().getFullYear()} Boopy. All rights reserved.
      </footer>
    </div>
  );
}
