import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

const jobClientMap = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    try {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const jobId = url.searchParams.get('jobId');
      
      if (jobId) {
        if (!jobClientMap.has(jobId)) jobClientMap.set(jobId, new Set());
        jobClientMap.get(jobId)!.add(ws);
        
        ws.on('close', () => {
          const clients = jobClientMap.get(jobId);
          if (clients) {
            clients.delete(ws);
            if (clients.size === 0) {
              jobClientMap.delete(jobId);
            }
          }
        });
      } else {
        ws.close();
      }
    } catch (e) {
      ws.close();
    }
  });
}

export function emitToJob(jobId: string, event: { type: string; payload: any }) {
  const clients = jobClientMap.get(jobId);
  if (clients) {
    const message = JSON.stringify(event);
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}
