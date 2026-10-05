import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type ChargerStatus = 'AVAILABLE'|'PREPARING'|'CHARGING'|'SUSPENDED_EV'|'SUSPENDED_EVSE'|'FINISHING'|'RESERVED'|'UNAVAILABLE'|'FAULTED'|'UNKNOWN';

@Injectable()
export class ChargersRepository {
  constructor(private readonly db: DatabaseService) {}
  async upsertFromBoot(chargePointId:string,vendor:string,model:string,serialNumber?:string) {
    const r=await this.db.query('INSERT INTO charging_stations (charge_point_id,vendor,model,serial_number,last_seen_at) VALUES ($1,$2,$3,$4,NOW()) ON CONFLICT (charge_point_id) DO UPDATE SET vendor=EXCLUDED.vendor,model=EXCLUDED.model,serial_number=EXCLUDED.serial_number,last_seen_at=NOW(),updated_at=NOW() RETURNING id,charge_point_id',[chargePointId,vendor,model,serialNumber??null]);
    return r.rows[0];
  }
  async touch(chargePointId:string) { await this.db.query('UPDATE charging_stations SET last_seen_at=NOW(),updated_at=NOW() WHERE charge_point_id=$1',[chargePointId]); }
  async updateConnectorStatus(chargePointId:string,connectorId:number,status:ChargerStatus,errorCode:string) {
    await this.db.query('INSERT INTO connectors (charging_station_id,connector_id,status,error_code,last_status_at) SELECT id,$2,$3,$4,NOW() FROM charging_stations WHERE charge_point_id=$1 ON CONFLICT (charging_station_id,connector_id) DO UPDATE SET status=EXCLUDED.status,error_code=EXCLUDED.error_code,last_status_at=NOW(),updated_at=NOW()',[chargePointId,connectorId,status,errorCode]);
  }
}
