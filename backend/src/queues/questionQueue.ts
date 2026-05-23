import { Queue } from 'bullmq';
import { env } from '../config/env';

export const questionQueue = new Queue('question-generation', {
  connection: {
    url: env.REDIS_URL,
  },
});
