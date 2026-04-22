"use client";

import { Bell, ChevronDown, CreditCard, LogOut, Settings, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkspaceSettingsDialog } from "@/components/boopy/workspace-settings-dialog";
import { useWorkspaceBilling } from "@/hooks/use-workspace-billing";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

function initials(email: string | undefined) {
  if (!email) return "?";
  const part = email.split("@")[0] ?? email;
  return part.slice(0, 2).toUpperCase();
}

export function AppHeader({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [workspaceSettings, setWorkspaceSettings] = useState<{
    workspaceId: string;
    name: string;
    defaultCurrency: string;
  } | null>(null);
  const billing = useWorkspaceBilling(workspaceSettings?.workspaceId ?? null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? undefined);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch("/api/workspace/settings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        workspace?: { id: string; name: string; defaultCurrency: string };
      };
      if (!payload.workspace) return;
      setWorkspaceSettings({
        workspaceId: payload.workspace.id,
        name: payload.workspace.name,
        defaultCurrency: payload.workspace.defaultCurrency,
      });
    });
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function saveWorkspaceSettings(input: { name: string; defaultCurrency: string }) {
    const supabase = getSupabaseBrowser();
    if (!supabase || !workspaceSettings) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    setSettingsSaving(true);
    const response = await fetch("/api/workspace/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        workspaceId: workspaceSettings.workspaceId,
        name: input.name,
        defaultCurrency: input.defaultCurrency,
      }),
    });
    setSettingsSaving(false);
    if (!response.ok) return;
    const payload = (await response.json()) as {
      workspace?: { id: string; name: string; defaultCurrency: string };
    };
    if (payload.workspace) {
      setWorkspaceSettings({
        workspaceId: payload.workspace.id,
        name: payload.workspace.name,
        defaultCurrency: payload.workspace.defaultCurrency,
      });
    }
    setSettingsOpen(false);
  }

  return (
    <header
      className={cn(
        "bg-background/80 sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b px-4 backdrop-blur md:px-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="font-heading text-foreground text-lg font-semibold tracking-tight"
        >
          Boopy
        </Link>
        <span className="text-muted-foreground hidden text-xs sm:inline">
          Subscription reminders
        </span>
        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/" && "bg-muted text-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/groups"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              (pathname === "/groups" || pathname.startsWith("/groups/")) &&
                "bg-muted text-foreground"
            )}
          >
            Groups
          </Link>
          <Link
            href="/subscriptions"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/subscriptions" && "bg-muted text-foreground"
            )}
          >
            Subscriptions
          </Link>
          <Link
            href="/calendar"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/calendar" && "bg-muted text-foreground"
            )}
          >
            Calendar
          </Link>
          <Link
            href="/documents"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/documents" && "bg-muted text-foreground"
            )}
          >
            Documents
          </Link>
          <Link
            href="/reports"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/reports" && "bg-muted text-foreground"
            )}
          >
            Reports
          </Link>
          <Link
            href="/notifications"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname === "/notifications" && "bg-muted text-foreground"
            )}
          >
            Notifications
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/settings/billing" className="hidden sm:block">
          <Badge variant={billing.plan === "pro" ? "secondary" : "outline"}>
            {billing.plan === "pro" ? "PRO" : "FREE"}
          </Badge>
        </Link>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground gap-1.5 px-2"
          )}
          onClick={() => setSettingsOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          <span className="text-xs">{workspaceSettings?.defaultCurrency ?? "USD"}</span>
        </button>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-muted-foreground",
            (pathname.startsWith("/settings/notifications") || pathname === "/notifications") &&
              "bg-muted text-foreground"
          )}
        >
          <Bell className="size-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 gap-2 px-2 font-normal"
            )}
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials(email)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-xs font-normal sm:inline">
              {email ?? "Account"}
            </span>
            <ChevronDown className="size-3.5 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">Signed in</p>
                  <p className="text-muted-foreground truncate text-xs">{email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2"
              onClick={() => {
                router.push("/settings/workspace");
              }}
            >
              <SlidersHorizontal className="size-4" />
              Workspace settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => {
                router.push("/settings/notifications");
              }}
            >
              <Settings className="size-4" />
              Notification settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2"
              onClick={() => {
                router.push("/settings/billing");
              }}
            >
              <CreditCard className="size-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {workspaceSettings ? (
        <WorkspaceSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          title="Workspace settings"
          description="Quickly update workspace name and default currency."
          initialName={workspaceSettings.name}
          initialCurrency={workspaceSettings.defaultCurrency}
          saving={settingsSaving}
          onSave={saveWorkspaceSettings}
        />
      ) : null}
    </header>
  );
}
