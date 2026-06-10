import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fredoka, Manrope } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boopy — Subscription Manager for Everyone",
  description:
    "Track every subscription, catch renewals before they hit, and understand your spending. Boopy works for personal use, teams, agencies, and businesses.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
