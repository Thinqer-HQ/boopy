"use client";

import { Bell, ChevronDown, CreditCard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? undefined);
    });
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
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
            href="/clients"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              (pathname === "/clients" || pathname.startsWith("/clients/")) &&
                "bg-muted text-foreground"
            )}
          >
            Clients
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/settings/notifications"
          aria-label="Notifications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-muted-foreground",
            pathname.startsWith("/settings/notifications") && "bg-muted text-foreground"
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
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">Signed in</p>
                <p className="text-muted-foreground truncate text-xs">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
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
    </header>
  );
}
