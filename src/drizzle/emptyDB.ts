import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { QueryResult } from 'pg';

const databaseURL = process.env.DATABASE_URL;

const db = drizzle(databaseURL) as NodePgDatabase<typeof schema>;

async function main() {
  console.log('🗑️ Emptying the entire database');

  // const tablesSchema = db._.fullSchema;
  // if (!tablesSchema) throw new Error('Schema not loaded');

  // const queries = Object.values(tablesSchema).map((table) => {
  //   console.log(`🧨 Preparing delete query for table: ${table.toString()}`);
  //   return sql.raw(`DELETE FROM ${table.toString()};`);
  // });

  // console.log('🛜 Sending delete queries');

  // await db.transaction(async (trx) => {
  //   await Promise.all(
  //     queries.map(async (query) => {
  //       if (query) await trx.execute(query);
  //     }),
  //   );
  // });

  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

  const tables: QueryResult<Record<string, string>> = await db.execute(query);

  console.log(tables);

  for (const table of tables.rows) {
    console.log(table);

    const query = sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`);
    await db.execute(query);
  }

  console.log('✅ Database emptied');
  return;
}

main()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(0);
  });
