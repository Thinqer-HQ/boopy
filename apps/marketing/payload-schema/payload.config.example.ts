import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";

import { MarketingSiteGlobal } from "./globals/marketing-site";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "change-me",
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  }),
  globals: [MarketingSiteGlobal],
});
