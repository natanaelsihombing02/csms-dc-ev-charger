import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

export const PG_POOL = Symbol('PG_POOL');

@Global()
@Module({
  providers: [{ provide: PG_POOL, useFactory: () => new Pool({ connectionString: process.env.DATABASE_URL }) }, DatabaseService],
  exports: [PG_POOL, DatabaseService],
})
export class DatabaseModule {}
