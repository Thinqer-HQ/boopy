"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/reports/spend";

type Row = { label: string; total: number };
type ChartMode = "bar" | "pie" | "line";

const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
];

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };
  const end = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function GroupAnalytics({ rows, currency = "USD" }: { rows: Row[]; currency?: string }) {
  const [mode, setMode] = useState<ChartMode>("bar");
  const topRows = rows.slice(0, 8);
  const total = useMemo(() => topRows.reduce((sum, row) => sum + row.total, 0), [topRows]);
  const max = useMemo(() => Math.max(...topRows.map((row) => row.total), 1), [topRows]);

  const linePoints = useMemo(() => {
    if (topRows.length === 0) return "";
    return topRows
      .map((row, index) => {
        const x = (index / Math.max(topRows.length - 1, 1)) * 320;
        const y = 160 - (row.total / max) * 140;
        return `${x},${y}`;
      })
      .join(" ");
  }, [topRows, max]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-indigo-50/30 dark:from-zinc-950 dark:to-indigo-950/20">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Group analytics</CardTitle>
            <CardDescription>Compare monthly spend by group with animated charts.</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-md border p-1">
            {(["bar", "pie", "line"] as const).map((chartMode) => (
              <Button
                key={chartMode}
                size="sm"
                variant={mode === chartMode ? "default" : "ghost"}
                onClick={() => setMode(chartMode)}
              >
                {chartMode}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No group data yet.</p>
        ) : null}

        {mode === "bar" ? (
          <div className="space-y-3">
            {topRows.map((row, index) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(row.total, currency)}
                  </span>
                </div>
                <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(6, Math.round((row.total / max) * 100))}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {mode === "pie" && topRows.length > 0 ? (
          <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
            <svg viewBox="0 0 240 240" className="mx-auto h-56 w-56">
              {topRows.map((row, index) => {
                const start = topRows
                  .slice(0, index)
                  .reduce(
                    (sum, current) => sum + (current.total / total) * Math.PI * 2,
                    -Math.PI / 2
                  );
                const end = start + (row.total / total) * Math.PI * 2;
                return (
                  <path
                    key={row.label}
                    d={arcPath(120, 120, 96, start, end)}
                    fill={COLORS[index % COLORS.length]}
                    className="origin-center transition-all duration-700 hover:scale-[1.02]"
                  />
                );
              })}
              <circle cx="120" cy="120" r="58" className="fill-background" />
              <text
                x="120"
                y="112"
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                Monthly
              </text>
              <text
                x="120"
                y="132"
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                {formatCurrency(total, currency)}
              </text>
            </svg>
            <div className="space-y-2">
              {topRows.map((row, index) => (
                <div
                  key={`legend-${row.label}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{row.label}</span>
                  </div>
                  <Badge variant="secondary">{Math.round((row.total / total) * 100)}%</Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "line" && topRows.length > 0 ? (
          <div className="space-y-3">
            <svg
              viewBox="0 0 320 180"
              className="w-full rounded-lg border bg-zinc-50/60 p-2 dark:bg-zinc-900/40"
            >
              <polyline
                points={linePoints}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(99,102,241,0.45)]"
              />
              {topRows.map((row, index) => {
                const x = (index / Math.max(topRows.length - 1, 1)) * 320;
                const y = 160 - (row.total / max) * 140;
                return <circle key={`point-${row.label}`} cx={x} cy={y} r="4" fill="#6366f1" />;
              })}
            </svg>
            <div className="grid gap-2 sm:grid-cols-2">
              {topRows.map((row) => (
                <div
                  key={`line-label-${row.label}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{formatCurrency(row.total, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
