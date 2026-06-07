import { cn } from "@/lib/utils";

const BRANDS: Record<string, { bg: string; fg: string; mark: string; border?: boolean }> = {
  Netflix: { bg: "#1c1b22", fg: "#e50914", mark: "N" },
  Spotify: { bg: "#1db954", fg: "#fff", mark: "♫" },
  Notion: { bg: "#fff", fg: "#15131c", mark: "N", border: true },
  "Adobe CC": { bg: "#e5101e", fg: "#fff", mark: "A" },
  "iCloud+": { bg: "#3a93ee", fg: "#fff", mark: "☁" },
  ChatGPT: { bg: "#0f9b78", fg: "#fff", mark: "●" },
  "Disney+": { bg: "#0c1a52", fg: "#fff", mark: "D" },
  Audible: { bg: "#f8991d", fg: "#15131c", mark: "a" },
  YouTube: { bg: "#ff0033", fg: "#fff", mark: "▶" },
  Figma: { bg: "#1e1e1e", fg: "#fff", mark: "F" },
  Slack: { bg: "#4a154b", fg: "#fff", mark: "S" },
  Dropbox: { bg: "#0061ff", fg: "#fff", mark: "◆" },
  AWS: { bg: "#232f3e", fg: "#ff9900", mark: "a" },
  Vercel: { bg: "#0a0a0a", fg: "#fff", mark: "▲" },
  Linear: { bg: "#5e6ad2", fg: "#fff", mark: "L" },
  GitHub: { bg: "#24292e", fg: "#fff", mark: "G" },
  Zoom: { bg: "#2d8cff", fg: "#fff", mark: "Z" },
  Microsoft: { bg: "#00a4ef", fg: "#fff", mark: "M" },
  Google: { bg: "#4285f4", fg: "#fff", mark: "G" },
  Patreon: { bg: "#f1465a", fg: "#fff", mark: "P" },
  Loom: { bg: "#625df5", fg: "#fff", mark: "◉" },
  Canva: { bg: "#00c4cc", fg: "#fff", mark: "C" },
  Shopify: { bg: "#96bf48", fg: "#fff", mark: "S" },
  Stripe: { bg: "#6772e5", fg: "#fff", mark: "S" },
  HubSpot: { bg: "#ff7a59", fg: "#fff", mark: "H" },
  Intercom: { bg: "#1f8ded", fg: "#fff", mark: "I" },
  Mailchimp: { bg: "#ffe01b", fg: "#241c15", mark: "M" },
};

type BrandTileProps = {
  name: string;
  size?: number;
  className?: string;
};

export function BrandTile({ name, size = 44, className }: BrandTileProps) {
  const b = BRANDS[name] ?? {
    bg: "var(--accent)",
    fg: "var(--accent-foreground)",
    mark: (name ?? "?")[0]?.toUpperCase() ?? "?",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center leading-none font-bold select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: b.bg,
        color: b.fg,
        fontSize: Math.round(size * 0.42),
        border: b.border ? "1px solid var(--border)" : undefined,
      }}
    >
      {b.mark}
    </div>
  );
}
