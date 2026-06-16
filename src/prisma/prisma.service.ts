import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL,
      }),
    });
  }

  /** Opens the Prisma database connection when the NestJS module starts. */
  async onModuleInit() {
    await this.$connect();
  }

  /** Closes the Prisma database connection when the NestJS module stops. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
