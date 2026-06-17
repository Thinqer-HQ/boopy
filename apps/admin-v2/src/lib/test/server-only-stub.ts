// Stub for the "server-only" package, aliased in vitest.config.ts.
// The real package throws when resolved outside Next.js's bundler, which
// would break unit tests for any module that imports it.
export {};
