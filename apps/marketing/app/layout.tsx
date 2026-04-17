import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boopy - Never Miss a Renewal",
  description:
    "Boopy helps teams and agencies track recurring subscriptions, manage renewal dates, and automate reminders.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
