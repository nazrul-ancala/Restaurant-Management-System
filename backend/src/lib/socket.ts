import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server | undefined;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });
  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
