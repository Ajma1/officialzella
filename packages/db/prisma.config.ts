import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` (run on every `npm install` via postinstall) doesn't
    // need a real connection, so this must not throw when unset — only
    // `prisma migrate` / `db push` / `studio` actually dial this URL, and
    // migrations always need a direct (non-pooled) connection.
    url: process.env.DIRECT_URL ?? "",
  },
});
