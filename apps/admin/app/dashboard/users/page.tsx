import Link from "next/link";
import { api, type UserSummary } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ page?: string; plan?: string; q?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const plan = params.plan as "pro" | "free" | undefined;
  const q = params.q;

  const data = await api.users(page, 30, plan);

  const filtered: UserSummary[] = q
    ? data.data.filter((u) => (u.email ?? "").toLowerCase().includes(q.toLowerCase()))
    : data.data;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { page: String(page), plan: plan ?? "", q: q ?? "", ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/dashboard/users?${sp.toString()}`;
  }

  const totalPages = data.pagination.totalPages;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Users</div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <form method="get" action="/dashboard/users" style={{ display: "flex", gap: "0.5rem" }}>
            {plan && <input type="hidden" name="plan" value={plan} />}
            <input
              className="input"
              name="q"
              defaultValue={q}
              placeholder="Search email…"
              style={{ width: 220 }}
            />
            <button className="btn btn-ghost" type="submit">
              Search
            </button>
          </form>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {(["all", "pro", "free"] as const).map((p) => (
              <Link
                key={p}
                href={buildUrl({ plan: p === "all" ? undefined : p, page: "1" })}
                className="btn btn-ghost"
                style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrap">
          <div className="table-header">
            <div>
              <span className="table-title">All users</span>
              <span className="table-count" style={{ marginLeft: "0.5rem" }}>
                {data.pagination.total} total
              </span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="empty">No users found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Billing status</th>
                  <th>Subs</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.email ?? "—"}</td>
                    <td>
                      <span className={`badge badge-${u.plan}`}>{u.plan}</span>
                    </td>
                    <td>
                      {u.billingStatus && (
                        <span
                          className={`badge badge-${u.billingStatus === "active" ? "active" : u.billingStatus === "canceled" ? "canceled" : u.billingStatus === "trialing" ? "trial" : "pending"}`}
                        >
                          {u.billingStatus}
                        </span>
                      )}
                    </td>
                    <td className="td-muted">
                      {u.activeSubscriptionCount}/{u.subscriptionCount}
                    </td>
                    <td className="td-muted">{u.joinedAt ? formatDate(u.joinedAt) : "—"}</td>
                    <td>
                      <Link
                        href={`/dashboard/users/${u.userId}`}
                        className="btn btn-ghost"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}
          >
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="btn btn-ghost">
                ← Prev
              </Link>
            )}
            <span style={{ padding: "0.5rem 1rem", fontSize: "0.82rem", color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="btn btn-ghost">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
