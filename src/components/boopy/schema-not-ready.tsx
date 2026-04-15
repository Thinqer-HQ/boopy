"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SchemaNotReady({ details }: { details?: string }) {
  return (
    <div className="p-8">
      <Alert>
        <AlertTitle>Database schema not initialized</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Boopy connected to Supabase, but core tables are missing. Apply
            `supabase/migrations/0001_init.sql` and `supabase/migrations/0002_billing.sql` to this
            project, then refresh.
          </p>
          {details ? (
            <p className="text-muted-foreground text-xs">
              Technical details: <code>{details}</code>
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}
