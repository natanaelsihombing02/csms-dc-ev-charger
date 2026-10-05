import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ChargersModule } from './chargers/chargers.module';
import { OcppModule } from './ocpp/ocpp.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ChargersModule, OcppModule] })
export class AppModule {}
