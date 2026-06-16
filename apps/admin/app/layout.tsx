import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Boopy Admin", template: "%s — Boopy Admin" },
  description: "Internal admin dashboard for Boopy.",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
