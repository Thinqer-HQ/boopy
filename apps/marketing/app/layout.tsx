import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boopy - Comprehensive Subscription Manager",
  description:
    "Boopy helps anyone manage subscriptions: personal use, group use, agencies, and businesses with one comprehensive subscription command center.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
