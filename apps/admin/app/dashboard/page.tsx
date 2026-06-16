import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await api.stats();

  const kpis = [
    { label: "Total Users", value: stats.users.total, dot: "dot-purple" },
    { label: "Pro Users", value: stats.users.pro, dot: "dot-green" },
    { label: "Free Users", value: stats.users.free, dot: "dot-blue" },
    { label: "Active Trials", value: stats.users.activeTrial, dot: "dot-yellow" },
  ];

  const secondary = [
    { label: "Workspaces", value: stats.workspaces.total },
    { label: "Total Subscriptions", value: stats.subscriptions.total },
    { label: "Active Subscriptions", value: stats.subscriptions.active },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-meta">As of {formatDate(stats.generatedAt)}</div>
        </div>
      </div>

      <div className="page-body section-gap">
        <div className="grid-4">
          {kpis.map((k) => (
            <div className="card" key={k.label}>
              <div className="card-title">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="stat-row mt-2">
                <div className={`stat-dot ${k.dot}`} />
                <span>users</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-3">
          {secondary.map((s) => (
            <div className="card" key={s.label}>
              <div className="card-title">{s.label}</div>
              <div className="kpi-value" style={{ fontSize: "1.6rem" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
