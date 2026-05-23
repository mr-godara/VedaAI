import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const questionQueue = new Queue('question-generation', {
  connection: redis,
});
