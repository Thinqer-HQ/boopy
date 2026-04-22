import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/reports/spend";

type Props = {
  rows: Array<{ month: string; total: number }>;
  currency?: string;
};

export function TrendCard({ rows, currency = "USD" }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly trend</CardTitle>
        <CardDescription>Estimated monthly spend over selected period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.month} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.month}</span>
              <span className="font-medium">{formatCurrency(row.total, currency)}</span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded">
              <div
                className="bg-primary h-full rounded"
                style={{
                  width: `${Math.min(100, Math.round((row.total / (rows[0]?.total || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
