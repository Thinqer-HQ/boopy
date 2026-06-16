import Link from "next/link";
import { api, type Subscription } from "../../../../lib/api";
import { formatDate, formatCurrency } from "../../../../lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params;

  let user;
  try {
    user = await api.user(userId);
  } catch {
    return (
      <>
        <div className="page-header">
          <div className="page-title">User not found</div>
        </div>
        <div className="page-body">
          <Link href="/dashboard/users" className="btn btn-ghost">
            ← Back to users
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">{user.email ?? userId}</div>
          <div className="page-meta">User ID: {userId}</div>
        </div>
        <Link href="/dashboard/users" className="btn btn-ghost">
          ← Back
        </Link>
      </div>

      <div className="page-body section-gap">
        <div className="grid-2">
          <div className="card">
            <div className="card-title">Account</div>
            <table style={{ marginTop: "0.5rem" }}>
              <tbody>
                {(
                  [
                    ["Email", user.email ?? "—"],
                    [
                      "Plan",
                      <span key="plan" className={`badge badge-${user.plan}`}>
                        {user.plan}
                      </span>,
                    ],
                    [
                      "Billing status",
                      user.billingStatus ? (
                        <span
                          key="bs"
                          className={`badge badge-${user.billingStatus === "active" ? "active" : user.billingStatus === "canceled" ? "canceled" : user.billingStatus === "trialing" ? "trial" : "pending"}`}
                        >
                          {user.billingStatus}
                        </span>
                      ) : (
                        "—"
                      ),
                    ],
                    ["Joined", user.joinedAt ? formatDate(user.joinedAt) : "—"],
                  ] as [string, React.ReactNode][]
                ).map(([label, val]) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "0.35rem 0.5rem 0.35rem 0",
                        color: "var(--muted)",
                        fontSize: "0.78rem",
                        width: 130,
                        verticalAlign: "middle",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{ padding: "0.35rem 0", fontSize: "0.82rem", verticalAlign: "middle" }}
                    >
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {user.workspaceId && (
            <div className="card">
              <div className="card-title">Workspace</div>
              <table style={{ marginTop: "0.5rem" }}>
                <tbody>
                  {(
                    [
                      ["Name", user.workspaceName ?? "—"],
                      ["Workspace ID", user.workspaceId],
                      [
                        "Subscriptions",
                        `${user.activeSubscriptionCount} active / ${user.subscriptionCount} total`,
                      ],
                      ["Groups", String(user.groupCount)],
                    ] as [string, string][]
                  ).map(([label, val]) => (
                    <tr key={label}>
                      <td
                        style={{
                          padding: "0.35rem 0.5rem 0.35rem 0",
                          color: "var(--muted)",
                          fontSize: "0.78rem",
                          width: 130,
                          verticalAlign: "middle",
                        }}
                      >
                        {label}
                      </td>
                      <td
                        style={{
                          padding: "0.35rem 0",
                          fontSize: "0.82rem",
                          verticalAlign: "middle",
                          fontFamily: label === "Workspace ID" ? "monospace" : undefined,
                          color: label === "Workspace ID" ? "var(--muted)" : undefined,
                        }}
                      >
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {user.subscriptions && user.subscriptions.length > 0 && (
          <div className="table-wrap">
            <div className="table-header">
              <div className="table-title">Subscriptions</div>
              <div className="table-count">{user.subscriptions.length} total</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Cadence</th>
                  <th>Next renewal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {user.subscriptions.map((s: Subscription) => (
                  <tr key={s.id}>
                    <td>{s.vendorName}</td>
                    <td>{formatCurrency(s.amount, s.currency)}</td>
                    <td className="td-muted">{s.cadence}</td>
                    <td className="td-muted">{s.renewalDate ? formatDate(s.renewalDate) : "—"}</td>
                    <td>
                      <span
                        className={`badge badge-${s.status === "active" ? "active" : "canceled"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
