#!/usr/bin/env node
// Ensures ajv-keywords@5 can resolve ajv@8 in workspace/monorepo installs where
// ajv@6 (from eslint) is hoisted to the root and shadows ajv@8 for peer-dep resolution.
const { existsSync, mkdirSync, symlinkSync } = require("fs");
const { join } = require("path");

const root = join(__dirname, "..");
const akwDir = join(root, "node_modules", "ajv-keywords");

if (!existsSync(akwDir)) process.exit(0);

const akwNodeModules = join(akwDir, "node_modules");
const ajvDst = join(akwNodeModules, "ajv");

if (existsSync(ajvDst)) process.exit(0);

const candidates = [
  join(root, "node_modules", "schema-utils", "node_modules", "ajv"),
  join(root, "apps", "mobile", "node_modules", "ajv"),
];

let ajvSrc = null;
for (const c of candidates) {
  try {
    const ver = require(join(c, "package.json")).version;
    if (ver.startsWith("8.")) {
      ajvSrc = c;
      break;
    }
  } catch (_) {}
}

if (!ajvSrc) {
  console.log("[fix-ajv] ajv@8 not found, skipping");
  process.exit(0);
}

try {
  mkdirSync(akwNodeModules, { recursive: true });
  const type = process.platform === "win32" ? "junction" : "dir";
  symlinkSync(ajvSrc, ajvDst, type);
  console.log("[fix-ajv] Linked ajv@8 for ajv-keywords");
} catch (e) {
  console.error("[fix-ajv] Symlink failed:", e.message);
}
