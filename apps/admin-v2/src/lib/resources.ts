import type { ResourceProps } from "@refinedev/core";

export const resources: ResourceProps[] = [
  {
    name: "admin_user_directory",
    list: "/dashboard/users",
    show: "/dashboard/users/show/:id",
    meta: { label: "Users" },
  },
  {
    name: "subscriptions",
    list: "/dashboard/subscriptions",
    show: "/dashboard/subscriptions/show/:id",
    meta: { label: "Subscriptions" },
  },
  {
    name: "workspaces",
    list: "/dashboard/workspaces",
    show: "/dashboard/workspaces/show/:id",
    meta: { label: "Workspaces" },
  },
  {
    name: "notification_jobs",
    list: "/dashboard/notifications",
    meta: { label: "Notifications" },
  },
  {
    name: "admin_alerts",
    list: "/dashboard/alerts",
    meta: { label: "Alerts" },
  },
];
