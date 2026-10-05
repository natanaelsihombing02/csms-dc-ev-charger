import { Injectable, Logger } from '@nestjs/common';
import { ChargersRepository, ChargerStatus } from '../chargers/chargers.repository';
export type OcppCall=[2,string,string,Record<string,unknown>];
export type OcppResult=[3,string,Record<string,unknown>];
export type OcppError=[4,string,string,string,Record<string,unknown>];
@Injectable()
export class OcppService {
 private readonly logger=new Logger(OcppService.name);
 constructor(private readonly chargers:ChargersRepository) {}
 async handleCall(cp:string,msg:OcppCall):Promise<OcppResult|OcppError>{
  const [,id,action,payload]=msg;
  switch(action){
   case 'BootNotification': return this.boot(cp,id,payload);
   case 'Heartbeat': return this.heartbeat(cp,id);
   case 'StatusNotification': return this.status(cp,id,payload);
   default: return [4,id,'NotImplemented',`Action ${action} is not implemented`,{}];
  }
 }
 private async boot(cp:string,id:string,p:Record<string,unknown>):Promise<OcppResult>{
  await this.chargers.upsertFromBoot(cp,String(p.chargePointVendor??'Unknown'),String(p.chargePointModel??'Unknown'),p.chargePointSerialNumber?String(p.chargePointSerialNumber):undefined);
  this.logger.log(`BootNotification accepted: ${cp}`);
  return [3,id,{status:'Accepted',currentTime:new Date().toISOString(),interval:30}];
 }
 private async heartbeat(cp:string,id:string):Promise<OcppResult>{ await this.chargers.touch(cp); return [3,id,{currentTime:new Date().toISOString()}]; }
 private async status(cp:string,id:string,p:Record<string,unknown>):Promise<OcppResult>{
  const connectorId=Number(p.connectorId??0); const status=String(p.status??'Unknown').toUpperCase() as ChargerStatus; const errorCode=String(p.errorCode??'NoError');
  await this.chargers.touch(cp); await this.chargers.updateConnectorStatus(cp,connectorId,status,errorCode); return [3,id,{}];
 }
}
