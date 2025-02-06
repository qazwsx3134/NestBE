import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/drizzle/schema/**.schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL, //postgres://user:password@host:port/db
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
