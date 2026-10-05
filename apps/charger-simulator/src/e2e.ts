import { OcppClient } from './ocpp-client.js';

const url = process.env.OCPP_URL ?? 'ws://localhost:3000/ocpp/DC-CHARGER-001';
const client = new OcppClient(url);

const assert = (condition:boolean,message:string) => {
  if(!condition) throw new Error(message);
};

try {
  console.log(`[E2E] Connecting to ${url}`);
  await client.connect();

  const boot=await client.call('BootNotification',{
    chargePointVendor:'Voksel',
    chargePointModel:'DC-FAST-60',
    chargePointSerialNumber:'E2E-DC-001'
  });
  assert(boot[0]===3,'BootNotification must return CALLRESULT');
  assert((boot[2] as Record<string,unknown>).status==='Accepted','BootNotification must be Accepted');

  const status=await client.call('StatusNotification',{
    connectorId:1,
    errorCode:'NoError',
    status:'Available',
    timestamp:new Date().toISOString()
  });
  assert(status[0]===3,'StatusNotification must return CALLRESULT');

  const heartbeat=await client.call('Heartbeat',{});
  assert(heartbeat[0]===3,'Heartbeat must return CALLRESULT');
  assert(typeof (heartbeat[2] as Record<string,unknown>).currentTime==='string','Heartbeat must return currentTime');

  console.log('[E2E] PASS BootNotification → StatusNotification → Heartbeat');
} finally {
  await client.close();
}
