"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◉" },
  { href: "/dashboard/users", label: "Users", icon: "◎" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "◈" },
  { href: "/dashboard/alerts", label: "Alerts", icon: "◆" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-dot">B</div>
          <div>
            <div className="sidebar-brand-text">Boopy</div>
            <div className="sidebar-brand-sub">Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV.map((item) => {
            const exact = item.href === "/dashboard";
            const active = exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "nav-item active" : "nav-item"}
              >
                <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item btn-danger"
            onClick={signOut}
            style={{ color: "rgba(255,255,255,0.4)", width: "100%" }}
          >
            <span style={{ fontSize: "0.85rem" }}>⎋</span>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
