import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { UsersCollection } from "./payload-schema/collections/users";
import { MarketingSiteGlobal } from "./payload-schema/globals/marketing-site";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "change-me-in-production",
  editor: lexicalEditor(),
  collections: [UsersCollection],
  globals: [MarketingSiteGlobal],
  admin: {
    user: UsersCollection.slug,
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  }),
  typescript: {
    outputFile: "./payload-types.ts",
  },
});
