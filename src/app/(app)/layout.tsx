import { AppShell } from "./app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppShell>{children}</AppShell>
    </div>
  );
}
