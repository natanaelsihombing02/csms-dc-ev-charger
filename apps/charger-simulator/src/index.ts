import { OcppClient } from './ocpp-client.js';

const url = process.argv[2] ?? 'ws://localhost:3000/ocpp/DC-CHARGER-001';
const client = new OcppClient(url);

console.log(`[SIMULATOR] Connecting to ${url}`);
await client.connect();
console.log('[SIMULATOR] Connected using OCPP 1.6');

for (const [action,payload] of [
  ['BootNotification',{chargePointVendor:'Voksel',chargePointModel:'DC-FAST-60',chargePointSerialNumber:'VKS-DC-001'}],
  ['StatusNotification',{connectorId:1,errorCode:'NoError',status:'Available',timestamp:new Date().toISOString()}],
  ['Heartbeat',{}]
] as const) {
  console.log(`[SIMULATOR] → ${action}`);
  const response=await client.call(action,payload);
  console.log(`[SIMULATOR] ← ${JSON.stringify(response)}`);
}

await client.close();
console.log('[SIMULATOR] Test sequence completed.');
