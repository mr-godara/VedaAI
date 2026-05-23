import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env';
import { connectDB } from './config/database';
import { setupWebSocket } from './websocket/wsServer';
import assignmentRoutes from './routes/assignmentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';
import path from 'path';

// Import to start worker
import './workers/questionWorker';

const app = express();
const server = createServer(app);

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api', uploadRoutes);
app.use('/api', healthRoutes);

// Error Handling
app.use(errorHandler);

// WebSocket
setupWebSocket(server);

// Start server
connectDB().then(() => {
  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
});
