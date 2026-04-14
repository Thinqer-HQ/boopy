import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MissingSupabaseConfig() {
  return (
    <div className="bg-muted/30 flex min-h-svh flex-1 flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Configure Supabase</CardTitle>
          <CardDescription>
            Boopy needs your Supabase project URL and anon key before auth and data work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Local development</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Copy <code className="bg-muted rounded px-1 py-0.5 text-xs">.env.example</code> to{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">.env.local</code> in this
                project, then set at least:
              </p>
              <ul className="list-inside list-disc text-sm">
                <li>
                  <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
                </li>
                <li>
                  <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                </li>
              </ul>
              <p className="text-sm">
                Restart <code className="text-xs">npm run dev</code> after saving.
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
