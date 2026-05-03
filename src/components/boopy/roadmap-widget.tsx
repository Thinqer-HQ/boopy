"use client";

import { ExternalLink, Loader2, Map as MapIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { safeExternalHref } from "@/lib/roadmap/safe-external-url";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export type RoadmapFeatureStatus = "shipped" | "planned" | "considering" | "feedback";

type RoadmapItemRow = {
  id: string;
  title: string;
  description: string | null;
  feature_status: string;
  link_url: string | null;
  sort_order: number;
};

const SECTION_LABELS: Record<RoadmapFeatureStatus, string> = {
  shipped: "Recently shipped",
  planned: "On the roadmap",
  considering: "Under consideration",
  feedback: "Your feedback",
};

const STATUS_ORDER: Record<RoadmapFeatureStatus, number> = {
  shipped: 0,
  planned: 1,
  considering: 2,
  feedback: 3,
};

const STATUSES = Object.keys(STATUS_ORDER) as RoadmapFeatureStatus[];

function isRoadmapStatus(value: string): value is RoadmapFeatureStatus {
  return (STATUSES as string[]).includes(value);
}

function sortRoadmapRows(list: RoadmapItemRow[]): RoadmapItemRow[] {
  return [...list].sort((a, b) => {
    const sa = isRoadmapStatus(a.feature_status) ? STATUS_ORDER[a.feature_status] : 99;
    const sb = isRoadmapStatus(b.feature_status) ? STATUS_ORDER[b.feature_status] : 99;
    if (sa !== sb) return sa - sb;
    return a.sort_order - b.sort_order;
  });
}

export function BoopyRoadmapWidget() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<RoadmapItemRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoadError("Sign in to load the roadmap.");
      setRows([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from("roadmap_items")
      .select("id,title,description,feature_status,link_url,sort_order")
      .eq("is_published", true);
    setLoading(false);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setRows(sortRoadmapRows((data ?? []) as RoadmapItemRow[]));
  }, []);

  const grouped = useMemo(() => {
    if (!rows?.length) return [];
    const valid = rows.filter((r) => isRoadmapStatus(r.feature_status));
    const byStatus = new Map<RoadmapFeatureStatus, RoadmapItemRow[]>();
    for (const status of STATUSES) {
      byStatus.set(status, []);
    }
    for (const row of valid) {
      const st = row.feature_status;
      if (!isRoadmapStatus(st)) continue;
      const list = byStatus.get(st)!;
      list.push(row);
    }
    return STATUSES.map((status) => ({
      status,
      title: SECTION_LABELS[status],
      items: (byStatus.get(status) ?? []).sort((a, b) => a.sort_order - b.sort_order),
    })).filter((section) => section.items.length > 0);
  }, [rows]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      void load();
    } else {
      setLoadError(null);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-background/95 pointer-events-auto shadow-md backdrop-blur-sm"
        onClick={() => handleOpenChange(true)}
        aria-label="Open product roadmap"
      >
        <MapIcon className="size-4" />
        Roadmap
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[min(32rem,85dvh)] gap-4 overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature roadmap</DialogTitle>
            <DialogDescription>
              Status and links from our team. Entries are managed in the database; optional links
              open blog posts or marketing pages in a new tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-sm">
            {loading && rows.length === 0 ? (
              <div className="text-muted-foreground flex items-center gap-2 py-6">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading roadmap…
              </div>
            ) : null}
            {loadError ? (
              <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-3 py-2 text-xs">
                <span>{loadError}</span>{" "}
                <button
                  type="button"
                  className="font-medium underline underline-offset-2"
                  onClick={() => void load()}
                >
                  Retry
                </button>
              </div>
            ) : null}
            {!loading && !loadError && rows.length === 0 ? (
              <p className="text-muted-foreground">No roadmap entries yet. Check back soon.</p>
            ) : null}
            {!loading && !loadError && grouped.length === 0 && rows.length > 0 ? (
              <p className="text-muted-foreground">No entries match the roadmap format.</p>
            ) : null}
            {grouped.map((section) => (
              <div key={section.status}>
                <p className="text-foreground mb-2 font-medium">{section.title}</p>
                <ul className="space-y-3">
                  {section.items.map((item) => {
                    const href = safeExternalHref(item.link_url);
                    return (
                      <li key={item.id} className="text-muted-foreground list-none">
                        <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
                          {href ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground hover:text-primary inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                            >
                              {item.title}
                              <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
                            </a>
                          ) : (
                            <span className="text-foreground font-medium">{item.title}</span>
                          )}
                        </div>
                        {item.description?.trim() ? (
                          <p className="mt-1 text-[13px] leading-snug whitespace-pre-wrap">
                            {item.description.trim()}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
