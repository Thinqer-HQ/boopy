/**
 * Web shim for expo-sqlite. Provides SQLiteProvider and useSQLiteContext
 * backed by an in-memory database so the app loads on web for UI testing.
 * Data does not persist across page reloads.
 */
import React, { createContext, useContext, useRef, type PropsWithChildren } from "react";
import { WebDatabase } from "./WebDatabase";

const DbContext = createContext<WebDatabase | null>(null);

interface SQLiteProviderProps extends PropsWithChildren {
  databaseName: string;
  onInit?: (db: WebDatabase) => void | Promise<void>;
}

export function SQLiteProvider({ children, onInit }: SQLiteProviderProps) {
  const dbRef = useRef<WebDatabase | null>(null);
  if (!dbRef.current) {
    dbRef.current = new WebDatabase();
    try {
      onInit?.(dbRef.current);
    } catch (e) {
      console.error("[BOOPY] Web DB init error:", e);
    }
  }
  return <DbContext.Provider value={dbRef.current}>{children}</DbContext.Provider>;
}

export function useSQLiteContext() {
  const db = useContext(DbContext);
  if (!db) throw new Error("useSQLiteContext must be inside <SQLiteProvider>");
  // Cast to any so screens that type it as SQLiteDatabase compile fine
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db as any;
}

// Re-export type stubs so imports don't break
export type SQLiteDatabase = WebDatabase;
export type SQLiteRunResult = { changes: number; lastInsertRowId: number };
