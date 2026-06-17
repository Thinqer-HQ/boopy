import type { Metadata } from "next";
import { Fredoka, Geist_Mono, Manrope } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { RefineProviders } from "@/providers/refine-providers";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Boopy Admin",
  description: "Internal admin dashboard for Boopy.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fredoka.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-svh">
        <Suspense>
          <RefineProviders>{children}</RefineProviders>
        </Suspense>
      </body>
    </html>
  );
}
