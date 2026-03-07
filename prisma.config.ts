import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        // Use direct URL for migrations when provided, otherwise fall back to DATABASE_URL.
        url: env("DIRECT_URL") || env("DATABASE_URL"),
    },
});
