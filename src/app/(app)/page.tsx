import { ArrowRight, Building2, CreditCard, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AppHome() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of clients and subscriptions. Add data next to see renewals here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">—</div>
            <p className="text-muted-foreground text-xs">Workspaces &amp; client records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">—</div>
            <p className="text-muted-foreground text-xs">Tracked recurring charges</p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (30d)</CardTitle>
            <Building2 className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-bold">—</div>
            <p className="text-muted-foreground text-xs">Renewals in the next month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Getting started</CardTitle>
              <Badge variant="secondary">MVP</Badge>
            </div>
            <CardDescription>
              Boopy uses your Supabase project for auth and data. Next you&apos;ll add clients and
              subscriptions from the plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm">
              <li>Confirm email sign-in works.</li>
              <li>Add clients under your workspace.</li>
              <li>Add subscriptions with renewal dates.</li>
              <li>Turn on email and push reminders.</li>
            </ol>
            <Separator />
            <p className="text-muted-foreground text-sm">
              UI is built with{" "}
              <a
                href="https://ui.shadcn.com/"
                className="text-foreground font-medium underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                shadcn/ui
              </a>{" "}
              components—customize tokens in{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">globals.css</code>.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-sm">
              Use the header menu to sign out. Client and subscription CRUD is next.
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Coming in the next tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-between" disabled>
              Add client
              <ArrowRight className="size-4 opacity-50" />
            </Button>
            <Button variant="outline" className="justify-between" disabled>
              Add subscription
              <ArrowRight className="size-4 opacity-50" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
