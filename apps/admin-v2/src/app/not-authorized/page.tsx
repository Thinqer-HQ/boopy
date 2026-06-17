export default function NotAuthorizedPage() {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <div className="max-w-sm text-center">
        <h1 className="font-heading text-foreground text-xl font-semibold">Not authorized</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your account isn&apos;t on the Boopy Admin allowlist. Ask an existing admin to add you.
        </p>
      </div>
    </div>
  );
}
