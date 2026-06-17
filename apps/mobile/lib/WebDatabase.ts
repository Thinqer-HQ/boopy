type Row = Record<string, unknown>;

export class WebDatabase {
  private tables: Record<string, Row[]> = {};

  private ensureTable(name: string): Row[] {
    if (!this.tables[name]) this.tables[name] = [];
    return this.tables[name];
  }

  private parseLiteral(raw: string): unknown {
    const v = raw.trim();
    if (v === "NULL" || v === "null") return null;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
    return v;
  }

  private splitByComma(str: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let inStr = false;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === "'" && !inStr) inStr = true;
      else if (c === "'" && inStr) inStr = false;
      if (!inStr && c === "(") depth++;
      else if (!inStr && c === ")") depth--;
      else if (!inStr && depth === 0 && c === ",") {
        result.push(str.slice(start, i).trim());
        start = i + 1;
      }
    }
    result.push(str.slice(start).trim());
    return result;
  }

  execSync(sql: string): void {
    // Create tables
    for (const m of sql.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/gi)) {
      this.ensureTable(m[1]);
    }
    // Seed rows via INSERT OR IGNORE
    const insertRe = /INSERT\s+OR\s+IGNORE\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi;
    for (const m of sql.matchAll(insertRe)) {
      const table = this.ensureTable(m[1]);
      const cols = m[2].split(",").map((c) => c.trim());
      const vals = this.splitByComma(m[3]).map((v) => this.parseLiteral(v));
      const row: Row = {};
      cols.forEach((c, i) => (row[c] = vals[i]));
      const pk = cols[0];
      if (!table.some((r) => r[pk] === row[pk])) table.push(row);
    }
  }

  private applyWhere(rows: Row[], whereClause: string, params: unknown[]): Row[] {
    const parts = whereClause.trim().split(/\s+AND\s+/i);
    let pi = 0;
    const conditions = parts.map((part) => {
      const m = part.trim().match(/^(\w+)\s*=\s*(.+)$/);
      if (!m) return null;
      const col = m[1];
      const token = m[2].trim();
      const val = token === "?" ? params[pi++] : this.parseLiteral(token);
      return { col, val };
    });
    return rows.filter((row) =>
      conditions.every((c) => {
        if (!c) return true;
        if (row[c.col] == null && c.val == null) return true;
        return String(row[c.col]) === String(c.val);
      })
    );
  }

  private applyOrder(rows: Row[], sql: string): Row[] {
    const m = sql.match(/\bORDER\s+BY\s+(.+?)(?:\s*;?\s*$)/is);
    if (!m) return rows;
    const clauses = m[1].split(",").map((c) => {
      const parts = c.trim().split(/\s+/);
      return { col: parts[0], desc: (parts[1] ?? "").toUpperCase() === "DESC" };
    });
    return [...rows].sort((a, b) => {
      for (const { col, desc } of clauses) {
        const av = String(a[col] ?? "");
        const bv = String(b[col] ?? "");
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp !== 0) return desc ? -cmp : cmp;
      }
      return 0;
    });
  }

  getAllSync<T>(sql: string, params: unknown[] = []): T[] {
    const tableMatch = sql.match(/\bFROM\s+(\w+)\b/i);
    if (!tableMatch) return [];
    let rows = [...this.ensureTable(tableMatch[1])];
    const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s*;?\s*$)/is);
    if (whereMatch) rows = this.applyWhere(rows, whereMatch[1], params);
    return this.applyOrder(rows, sql) as unknown as T[];
  }

  getFirstSync<T>(sql: string, params: unknown[] = []): T | null {
    return this.getAllSync<T>(sql, params)[0] ?? null;
  }

  runSync(sql: string, params: unknown[] = []): void {
    const upper = sql.trimStart().toUpperCase();
    if (upper.startsWith("INSERT")) {
      this.execInsert(sql, params);
    } else if (upper.startsWith("UPDATE")) {
      this.execUpdate(sql, params);
    }
  }

  private execInsert(sql: string, params: unknown[]): void {
    const m = sql.match(
      /INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
    );
    if (!m) return;
    const tableName = m[1];
    const cols = m[2].split(",").map((c) => c.trim());
    const tokens = this.splitByComma(m[3]);
    let pi = 0;
    const row: Row = {};
    cols.forEach((col, i) => {
      const token = tokens[i]?.trim();
      row[col] = token === "?" ? params[pi++] : this.parseLiteral(token ?? "NULL");
    });
    const table = this.ensureTable(tableName);
    if (/INSERT\s+OR\s+REPLACE/i.test(sql)) {
      const pk = cols[0];
      const idx = table.findIndex((r) => r[pk] == row[pk]);
      if (idx >= 0) {
        table[idx] = row;
        return;
      }
    }
    table.push(row);
  }

  private execUpdate(sql: string, params: unknown[]): void {
    const tableMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
    if (!tableMatch) return;
    const table = this.ensureTable(tableMatch[1]);
    const setWhereMatch = sql.match(/\bSET\s+(.+?)\s+WHERE\s+(.+?)(?:\s*;?\s*$)/is);
    if (!setWhereMatch) return;
    const [, setClause, whereClause] = setWhereMatch;
    const setParamCount = (setClause.match(/\?/g) ?? []).length;
    const setParams = params.slice(0, setParamCount);
    const whereParams = params.slice(setParamCount);
    let setPI = 0;
    const pairs = this.splitByComma(setClause).map((pair) => {
      const pm = pair.trim().match(/^(\w+)\s*=\s*(.+)$/);
      if (!pm) return null;
      const token = pm[2].trim();
      let val: unknown;
      if (token === "?") val = setParams[setPI++];
      else if (token === "datetime('now')") val = new Date().toISOString();
      else val = this.parseLiteral(token);
      return { col: pm[1], val };
    });
    const matching = this.applyWhere(table, whereClause, whereParams);
    for (const row of matching) {
      for (const p of pairs) {
        if (p) row[p.col] = p.val;
      }
    }
  }
}
