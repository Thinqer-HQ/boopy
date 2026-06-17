"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router/app";
import { dataProvider } from "@refinedev/supabase";

import { resources } from "@/lib/resources";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { authProvider } from "./auth-provider";

export function RefineProviders({ children }: { children: React.ReactNode }) {
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider(getSupabaseBrowserClient())}
      authProvider={authProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        disableTelemetry: true,
        disableRouteChangeHandler: true,
        projectId: "boopy-admin-v2",
      }}
    >
      {children}
    </Refine>
  );
}
