import { Logger } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { OcppService, OcppCall } from './ocpp.service';

@WebSocketGateway({ path:'/ocpp' })
export class OcppGateway {
 private readonly logger=new Logger(OcppGateway.name);
 private readonly connections=new Map<string,WebSocket>();
 @WebSocketServer() server!: WebSocket;
 constructor(private readonly ocpp:OcppService) {}
 afterInit(server:WebSocket){
  server.on('connection',(socket:WebSocket,request:IncomingMessage)=>this.onConnection(socket,request));
 }
 private onConnection(socket:WebSocket,request:IncomingMessage){
  const cp=this.parseChargePointId(request.url);
  if(!cp){ socket.close(1008,'Charge point ID required'); return; }
  const previous=this.connections.get(cp); if(previous&&previous!==socket) previous.close(1000,'Replaced by new connection');
  this.connections.set(cp,socket);
  this.logger.log(`OCPP connected: ${cp}`);
  socket.on('message',async data=>{
   try{ const msg=JSON.parse(data.toString()) as unknown; if(!this.isCall(msg)){ socket.send(JSON.stringify([4,'','ProtocolError','Expected OCPP CALL frame',{}])); return; }
    socket.send(JSON.stringify(await this.ocpp.handleCall(cp,msg)));
   }catch(error){ this.logger.error(`OCPP message error for ${cp}`,error instanceof Error?error.stack:undefined); socket.send(JSON.stringify([4,'','ProtocolError','Invalid OCPP frame',{}])); }
  });
  socket.on('close',()=>{if(this.connections.get(cp)===socket)this.connections.delete(cp);this.logger.log(`OCPP disconnected: ${cp}`);});
 }
 private isCall(value:unknown):value is OcppCall{return Array.isArray(value)&&value.length===4&&value[0]===2&&typeof value[1]==='string'&&typeof value[2]==='string'&&typeof value[3]==='object'&&value[3]!==null&&!Array.isArray(value[3]);}
 private parseChargePointId(url?:string){if(!url)return;const path=(url.split('?')[0]??'').split('/').filter(Boolean);const i=path.lastIndexOf('ocpp');return i>=0?path[i+1]:undefined;}
}
