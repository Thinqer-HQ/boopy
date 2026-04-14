"use client";

import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

function initials(email: string | undefined) {
  if (!email) return "?";
  const part = email.split("@")[0] ?? email;
  return part.slice(0, 2).toUpperCase();
}

export function AppHeader({ className }: { className?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    const supabase = supabaseBrowser();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? undefined);
    });
  }, []);

  async function signOut() {
    const supabase = supabaseBrowser();
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
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Notifications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-muted-foreground"
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
            <DropdownMenuItem disabled className="gap-2">
              <Settings className="size-4" />
              Settings
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
