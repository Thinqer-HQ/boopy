type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

const isProduction = process.env.NODE_ENV === "production";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const defaultLevel: LogLevel = isProduction ? "info" : "debug";

const redactKeyPattern =
  /(^|_)(password|pass|secret|token|api[_-]?key|key|authorization|cookie|session)(_|$)/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function redactValue(value: unknown, depth: number): unknown {
  if (depth <= 0) return "[REDACTED]";

  if (Array.isArray(value)) {
    return value.map((v) => redactValue(v, depth - 1));
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactKeyPattern.test(k) ? "[REDACTED]" : redactValue(v, depth - 1);
    }
    return out;
  }

  return value;
}

function shouldLog(level: LogLevel, currentLevel: LogLevel) {
  return levelPriority[level] >= levelPriority[currentLevel];
}

function emit(
  level: LogLevel,
  message: string,
  fields?: LogFields,
  currentLevel: LogLevel = defaultLevel
) {
  if (!shouldLog(level, currentLevel)) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...(fields ? (redactValue(fields, 6) as LogFields) : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug(message: string, fields?: LogFields) {
    emit("debug", message, fields);
  },
  info(message: string, fields?: LogFields) {
    emit("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    emit("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    emit("error", message, fields);
  },
};
