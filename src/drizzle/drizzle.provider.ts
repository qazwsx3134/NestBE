//drizzle.provider.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider, // This specifies the token that is used to identify the provider.
    inject: [ConfigService], // This specifies the dependencies that are injected into the provider.
    useFactory: async (configService: ConfigService) => {
      // This is a factory function that creates the provider.
      const databaseURL = configService.get<string>('DATABASE_URL');
      // const pool = new Pool({
      //   connectionString: databaseURL,
      //   ssl: {
      //     rejectUnauthorized: false,
      //   },
      // });

      return drizzle(databaseURL, { schema: schema }) as NodePgDatabase<
        typeof schema
      >;
    },
  },
];
