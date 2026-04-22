import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/reports/spend";

type Props = {
  title: string;
  description: string;
  rows: Array<{ label: string; total: number }>;
  currency?: string;
};

export function BreakdownCard({ title, description, rows, currency = "USD" }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.slice(0, 8).map((row) => (
          <div key={`${title}-${row.label}`} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{formatCurrency(row.total, currency)}</span>
          </div>
        ))}
        {rows.length === 0 ? <p className="text-muted-foreground text-sm">No data yet.</p> : null}
      </CardContent>
    </Card>
  );
}
