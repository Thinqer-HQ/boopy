"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Workspace id from `/api/workspace/settings` (same source as the header). Null while loading or if unset. */
const ActiveWorkspaceContext = createContext<string | null>(null);

export function ActiveWorkspaceProvider({
  workspaceId,
  children,
}: {
  workspaceId: string | null;
  children: ReactNode;
}) {
  return (
    <ActiveWorkspaceContext.Provider value={workspaceId}>
      {children}
    </ActiveWorkspaceContext.Provider>
  );
}

export function useActiveWorkspaceId(): string | null {
  return useContext(ActiveWorkspaceContext);
}
