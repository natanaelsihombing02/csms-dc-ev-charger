'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Frame = [number, string, ...unknown[]];
type Log = { id:number; time:string; kind:'tx'|'rx'|'system'|'error'; message:string };

export default function ChargerSimulatorPage() {
  const socket = useRef<WebSocket|null>(null);
  const seq = useRef(0);
  const logSeq = useRef(0);
  const pending = useRef(new Map<string,(f:Frame)=>void>());
  const [baseUrl,setBaseUrl] = useState('ws://localhost:3000/ocpp');
  const [chargePointId,setChargePointId] = useState('DC-CHARGER-001');
  const [connectorId,setConnectorId] = useState('1');
  const [vendor,setVendor] = useState('Voksel');
  const [model,setModel] = useState('DC-FAST-60');
  const [serial,setSerial] = useState('VKS-DC-001');
  const [state,setState] = useState<'Disconnected'|'Connecting'|'Connected'>('Disconnected');
  const [status,setStatus] = useState('Unknown');
  const [logs,setLogs] = useState<Log[]>([]);
  const [busy,setBusy] = useState(false);
  const endpoint = useMemo(() => baseUrl.replace(/\/$/,'') + '/' + encodeURIComponent(chargePointId), [baseUrl,chargePointId]);

  const addLog = (kind:Log['kind'],message:string) =>
    setLogs(v => [{id:++logSeq.current,time:new Date().toLocaleTimeString(),kind,message},...v].slice(0,150));

  useEffect(() => () => socket.current?.close(), []);

  const connect = () => {
    socket.current?.close();
    setState('Connecting'); addLog('system',`Connecting to ${endpoint}`);
    const ws = new WebSocket(endpoint,'ocpp1.6'); socket.current = ws;
    ws.onopen = () => { setState('Connected'); addLog('system','Connected with subprotocol ocpp1.6'); };
    ws.onmessage = e => {
      try {
        const f = JSON.parse(e.data) as Frame; addLog('rx',JSON.stringify(f));
        if (f[0] === 3 && typeof f[1] === 'string') {
          const resolver = pending.current.get(f[1]); if (resolver) { pending.current.delete(f[1]); resolver(f); }
        }
      } catch { addLog('error','Invalid JSON frame received'); }
    };
    ws.onerror = () => addLog('error','WebSocket error');
    ws.onclose = e => { if(socket.current===ws) socket.current=null; setState('Disconnected'); addLog('system',`Closed: ${e.code} ${e.reason||''}`); };
  };

  const disconnect = () => { socket.current?.close(1000,'Simulator disconnected'); socket.current=null; setState('Disconnected'); };

  const call = (action:string,payload:Record<string,unknown>) => {
    const ws=socket.current;
    if(!ws || ws.readyState!==WebSocket.OPEN) { addLog('error','Connect simulator first'); return Promise.reject(new Error('Not connected')); }
    const id=`sim-${Date.now()}-${++seq.current}`; const frame:Frame=[2,id,action,payload];
    addLog('tx',JSON.stringify(frame)); ws.send(JSON.stringify(frame));
    return new Promise<Frame>((resolve,reject) => {
      const timer=window.setTimeout(()=>{pending.current.delete(id);reject(new Error(`Timeout: ${action}`));},10000);
      pending.current.set(id,f=>{window.clearTimeout(timer);resolve(f);});
    });
  };

  const run = async (action:string,payload:Record<string,unknown>,nextStatus?:string) => {
    setBusy(true);
    try { const response=await call(action,payload); if(nextStatus) setStatus(nextStatus); addLog('system',`${action} response: ${JSON.stringify(response[2]??response)}`); }
    catch(e) { addLog('error',e instanceof Error?e.message:'Request failed'); }
    finally { setBusy(false); }
  };

  return <main className="simulator-shell">
    <header className="sim-header"><div><a href="/" className="back-link">← CSMS Voksel</a><p className="eyebrow">OCPP 1.6J TEST LAB</p><h1>DC Charger Simulator</h1></div>
      <div className={`connection-badge ${state.toLowerCase()}`}><span className="dot"/>{state}</div></header>

    <section className="sim-grid">
      <aside className="panel">
        <div className="panel-title"><div><span className="label">01</span><h2>Charger Configuration</h2></div></div>
        {[
          ['OCPP URL',baseUrl,setBaseUrl],
          ['Charge Point ID',chargePointId,setChargePointId],
          ['Connector ID',connectorId,setConnectorId],
          ['Vendor',vendor,setVendor],
          ['Model',model,setModel],
          ['Serial Number',serial,setSerial]
        ].map(([label,value,setter]) => <label key={String(label)}>{label}<input value={String(value)} onChange={e=>(setter as (v:string)=>void)(e.target.value)}/></label>)}
        <div className="endpoint"><span>Resolved endpoint</span><code>{endpoint}</code></div>
        <div className="button-row"><button className="primary-button" onClick={connect} disabled={state==='Connected'}>Connect</button>
          <button className="secondary-button" onClick={disconnect} disabled={state==='Disconnected'}>Disconnect</button></div>
      </aside>

      <section className="panel">
        <div className="panel-title"><div><span className="label">02</span><h2>OCPP Lifecycle</h2></div><span className="status-text">Connector: {status}</span></div>
        <div className="lifecycle-grid">
          <button disabled={busy||state!=='Connected'} onClick={()=>run('BootNotification',{chargePointVendor:vendor,chargePointModel:model,chargePointSerialNumber:serial})}><b>BootNotification</b><span>Register charger</span></button>
          <button disabled={busy||state!=='Connected'} onClick={()=>run('StatusNotification',{connectorId:Number(connectorId),errorCode:'NoError',status:'Available',timestamp:new Date().toISOString()},'Available')}><b>Available</b><span>StatusNotification</span></button>
          <button disabled={busy||state!=='Connected'} onClick={()=>run('StatusNotification',{connectorId:Number(connectorId),errorCode:'NoError',status:'Preparing',timestamp:new Date().toISOString()},'Preparing')}><b>Preparing</b><span>StatusNotification</span></button>
          <button disabled={busy||state!=='Connected'} onClick={()=>run('StatusNotification',{connectorId:Number(connectorId),errorCode:'NoError',status:'Charging',timestamp:new Date().toISOString()},'Charging')}><b>Charging</b><span>StatusNotification</span></button>
          <button disabled={busy||state!=='Connected'} onClick={()=>run('StatusNotification',{connectorId:Number(connectorId),errorCode:'NoError',status:'Finishing',timestamp:new Date().toISOString()},'Finishing')}><b>Finishing</b><span>StatusNotification</span></button>
          <button disabled={busy||state!=='Connected'} onClick={()=>run('Heartbeat',{})}><b>Heartbeat</b><span>Keep-alive request</span></button>
        </div>
        <div className="protocol-card"><span>Endpoint</span><strong>{endpoint}</strong><span>Subprotocol</span><strong>ocpp1.6</strong><span>Frame</span><strong>[2, uniqueId, action, payload]</strong></div>
      </section>
    </section>

    <section className="panel log-panel"><div className="panel-title"><div><span className="label">03</span><h2>Live Protocol Log</h2></div><button className="clear-button" onClick={()=>setLogs([])}>Clear</button></div>
      <div className="log-list">{logs.length===0?<div className="empty-log">Belum ada event. Connect simulator untuk memulai.</div>:logs.map(l=>
        <div className={`log-line ${l.kind}`} key={l.id}><time>{l.time}</time><span className="log-kind">{l.kind.toUpperCase()}</span><code>{l.message}</code></div>)}</div>
    </section>
    <footer className="test-footer"><div><strong>Manual E2E</strong><span>Browser → WebSocket → NestJS → PostgreSQL</span></div><div><strong>Next</strong><span>StartTransaction → MeterValues → StopTransaction</span></div></footer>
  </main>;
}
