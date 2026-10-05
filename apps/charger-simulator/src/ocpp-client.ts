import WebSocket from 'ws';

export type OcppCall = [2,string,string,Record<string,unknown>];
export type OcppFrame = [number,string,...unknown[]];

export class OcppClient {
  private ws?: WebSocket;
  private counter = 0;

  constructor(private readonly url:string) {}

  async connect(): Promise<void> {
    await new Promise<void>((resolve,reject) => {
      const ws = new WebSocket(this.url, 'ocpp1.6');
      this.ws = ws;
      ws.once('open', resolve);
      ws.once('error', reject);
    });
  }

  async call(action:string,payload:Record<string,unknown>):Promise<OcppFrame> {
    const ws=this.ws;
    if(!ws || ws.readyState!==WebSocket.OPEN) throw new Error('OCPP client is not connected');
    const id=`sim-${Date.now()}-${++this.counter}`;
    const frame:OcppCall=[2,id,action,payload];

    return new Promise<OcppFrame>((resolve,reject) => {
      const timer=setTimeout(()=>{ cleanup(); reject(new Error(`Timeout waiting for ${action}`)); },10000);
      const onMessage=(data:WebSocket.RawData)=>{
        try {
          const response=JSON.parse(data.toString()) as OcppFrame;
          if(response[1]!==id) return;
          cleanup();
          resolve(response);
        } catch { /* ignore unrelated/invalid frames */ }
      };
      const onClose=()=>{ cleanup(); reject(new Error('OCPP connection closed')); };
      const cleanup=()=>{ clearTimeout(timer); ws.off('message',onMessage); ws.off('close',onClose); };
      ws.on('message',onMessage);
      ws.once('close',onClose);
      ws.send(JSON.stringify(frame));
    });
  }

  async close():Promise<void> {
    const ws=this.ws;
    if(!ws) return;
    await new Promise<void>(resolve=>{ ws.once('close',()=>resolve()); ws.close(); });
    this.ws=undefined;
  }
}
