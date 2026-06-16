import { api, type Alert } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const data = await api.alerts();
  const { alerts, counts } = data;

  const churnedPro = alerts.filter((a: Alert) => a.type === "churned_pro");
  const nearLimit = alerts.filter((a: Alert) => a.type === "near_free_limit");

  return (
    <>
      <div className="page-header">
        <div className="page-title">Alerts</div>
        <div className="page-meta">Churn signals & plan limit warnings</div>
      </div>

      <div className="page-body section-gap">
        <div className="grid-2">
          <div className="card">
            <div className="card-title">Churned Pro users</div>
            <div
              className="kpi-value"
              style={{ color: counts.churnedPro > 0 ? "var(--red)" : undefined }}
            >
              {counts.churnedPro}
            </div>
            <div className="kpi-sub">Previously paid, now canceled</div>
          </div>
          <div className="card">
            <div className="card-title">Near free limit</div>
            <div
              className="kpi-value"
              style={{ color: counts.nearFreeLimit > 0 ? "var(--yellow)" : undefined }}
            >
              {counts.nearFreeLimit}
            </div>
            <div className="kpi-sub">Free users with 2 of 3 subscriptions used</div>
          </div>
        </div>

        {churnedPro.length > 0 && (
          <div className="table-wrap">
            <div className="table-header">
              <div>
                <span className="table-title">Churned Pro</span>
                <span className="table-count" style={{ marginLeft: "0.5rem" }}>
                  {churnedPro.length}
                </span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Workspace</th>
                  <th>Detail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {churnedPro.map((a: Alert, i: number) => (
                  <tr key={i}>
                    <td>{a.email ?? "—"}</td>
                    <td className="td-mono">{a.workspaceName ?? a.workspaceId}</td>
                    <td className="td-muted">{a.detail}</td>
                    <td>
                      <span className="badge badge-churned">churned</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {nearLimit.length > 0 && (
          <div className="table-wrap">
            <div className="table-header">
              <div>
                <span className="table-title">Near free plan limit</span>
                <span className="table-count" style={{ marginLeft: "0.5rem" }}>
                  {nearLimit.length}
                </span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Workspace</th>
                  <th>Detail</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {nearLimit.map((a: Alert, i: number) => (
                  <tr key={i}>
                    <td>{a.email ?? "—"}</td>
                    <td className="td-mono">{a.workspaceName ?? a.workspaceId}</td>
                    <td className="td-muted">{a.detail}</td>
                    <td>
                      <span className="badge badge-limit">near limit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {churnedPro.length === 0 && nearLimit.length === 0 && (
          <div className="table-wrap">
            <div className="empty">No active alerts — all looks good.</div>
          </div>
        )}
      </div>
    </>
  );
}
