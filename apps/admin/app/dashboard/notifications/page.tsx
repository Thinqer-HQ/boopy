import { api } from "../../../lib/api";
import { formatDateTime } from "../../../lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const data = await api.notifications();
  const { jobs, digests, recentFailures } = data;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Notifications</div>
        <div className="page-meta">Push + email delivery health</div>
      </div>

      <div className="page-body section-gap">
        <div className="grid-3">
          {[
            { label: "Pending jobs", value: jobs.pending, dot: "dot-yellow" },
            { label: "Sent (last 24h)", value: jobs.sent24h, dot: "dot-green" },
            { label: "Failed (total)", value: jobs.failedTotal, dot: "dot-red" },
          ].map((k) => (
            <div className="card" key={k.label}>
              <div className="card-title">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="stat-row mt-2">
                <div className={`stat-dot ${k.dot}`} />
                <span>notification jobs</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">Email digests — pending</div>
            <div className="kpi-value" style={{ fontSize: "1.6rem" }}>
              {digests.pending}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Email digests — failed</div>
            <div
              className="kpi-value"
              style={{ fontSize: "1.6rem", color: digests.failed > 0 ? "var(--red)" : undefined }}
            >
              {digests.failed}
            </div>
          </div>
        </div>

        {recentFailures && recentFailures.length > 0 ? (
          <div className="table-wrap">
            <div className="table-header">
              <div className="table-title">Recent failures</div>
              <div className="table-count">{recentFailures.length} shown</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Workspace</th>
                  <th>Channel</th>
                  <th>Attempts</th>
                  <th>Error</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentFailures.map((f, i) => (
                  <tr key={i}>
                    <td className="td-mono">{f.workspaceName ?? f.workspaceId}</td>
                    <td>
                      {f.channel && (
                        <span className={`badge badge-${f.channel === "email" ? "email" : "push"}`}>
                          {f.channel}
                        </span>
                      )}
                    </td>
                    <td className="td-muted">{f.attemptCount}</td>
                    <td
                      style={{
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--red)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {f.error ?? "—"}
                    </td>
                    <td className="td-muted">{formatDateTime(f.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <div className="empty">No recent failures — delivery looks healthy.</div>
          </div>
        )}
      </div>
    </>
  );
}
