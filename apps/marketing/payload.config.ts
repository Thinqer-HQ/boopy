import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { UsersCollection } from "./payload-schema/collections/users";
import { MarketingSiteGlobal } from "./payload-schema/globals/marketing-site";

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL;
const usePostgres = Boolean(connectionString && !connectionString.startsWith("file:"));
const sqliteURL =
  (connectionString && connectionString.startsWith("file:") ? connectionString : undefined) ||
  process.env.PAYLOAD_SQLITE_PATH ||
  (process.env.VERCEL ? "file:/tmp/payload.db" : "file:./payload.db");

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "change-me-in-production",
  editor: lexicalEditor(),
  collections: [UsersCollection],
  globals: [MarketingSiteGlobal],
  admin: {
    user: UsersCollection.slug,
  },
  db: usePostgres
    ? postgresAdapter({
        pool: {
          connectionString,
        },
      })
    : sqliteAdapter({
        client: {
          url: sqliteURL,
        },
      }),
  typescript: {
    outputFile: "./payload-types.ts",
  },
});
