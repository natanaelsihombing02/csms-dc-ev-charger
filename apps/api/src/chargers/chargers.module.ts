import { Module } from '@nestjs/common';
import { ChargersRepository } from './chargers.repository';
@Module({ providers: [ChargersRepository], exports: [ChargersRepository] })
export class ChargersModule {}
