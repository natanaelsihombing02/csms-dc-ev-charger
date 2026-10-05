import { Logger } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server, WebSocket } from 'ws';
import { OcppService, OcppCall } from './ocpp.service';

@WebSocketGateway()
export class OcppGateway {
  private readonly logger = new Logger(OcppGateway.name);
  private readonly connections = new Map<string, WebSocket>();
  constructor(private readonly ocpp: OcppService) {}

  afterInit(server: Server) {
    server.on('connection', (socket: WebSocket, request: IncomingMessage) => this.onConnection(socket, request));
  }
  private onConnection(socket: WebSocket, request: IncomingMessage) {
    const protocol = request.headers['sec-websocket-protocol'];
    if (typeof protocol !== 'string' || !protocol.split(',').map(value => value.trim()).includes('ocpp1.6')) {
      socket.close(1002, 'OCPP 1.6 subprotocol required');
      return;
    }
    const chargePointId = this.parseChargePointId(request.url);
    if (!chargePointId) { socket.close(1008, 'Charge point ID required'); return; }
    const previous = this.connections.get(chargePointId);
    if (previous && previous !== socket) previous.close(1000, 'Replaced by new connection');
    this.connections.set(chargePointId, socket);
    this.logger.log(`OCPP connected: ${chargePointId}`);
    socket.on('message', async data => {
      try {
        const message = JSON.parse(data.toString()) as unknown;
        if (!this.isCall(message)) { socket.send(JSON.stringify([4, '', 'ProtocolError', 'Expected OCPP CALL frame', {}])); return; }
        socket.send(JSON.stringify(await this.ocpp.handleCall(chargePointId, message)));
      } catch (error) {
        this.logger.error(`OCPP message error for ${chargePointId}`, error instanceof Error ? error.stack : undefined);
        socket.send(JSON.stringify([4, '', 'ProtocolError', 'Invalid OCPP frame', {}]));
      }
    });
    socket.on('close', () => {
      if (this.connections.get(chargePointId) === socket) this.connections.delete(chargePointId);
      this.logger.log(`OCPP disconnected: ${chargePointId}`);
    });
  }
  private isCall(value: unknown): value is OcppCall {
    return Array.isArray(value) && value.length === 4 && value[0] === 2 && typeof value[1] === 'string' && typeof value[2] === 'string' && typeof value[3] === 'object' && value[3] !== null && !Array.isArray(value[3]);
  }
  private parseChargePointId(url?: string) {
    if (!url) return undefined;
    const path = (url.split('?')[0] ?? '').split('/').filter(Boolean);
    if (path[0] !== 'ocpp' || !path[1]) return undefined;
    return path[1];
  }
}
