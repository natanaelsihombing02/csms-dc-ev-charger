import { Module } from '@nestjs/common';
import { ChargersModule } from '../chargers/chargers.module';
import { OcppGateway } from './ocpp.gateway';
import { OcppService } from './ocpp.service';
@Module({ imports:[ChargersModule], providers:[OcppGateway,OcppService] })
export class OcppModule {}
