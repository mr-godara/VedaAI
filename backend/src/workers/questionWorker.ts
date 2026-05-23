import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { aiService } from '../services/aiService';
import { emitToJob } from '../websocket/wsServer';
import { redis } from '../config/redis';
import fs from 'fs/promises';
import path from 'path';
const pdfParse = require('pdf-parse');

export const questionWorker = new Worker(
  'question-generation',
  async (job: Job) => {
    const { assignmentId } = job.data;
    
    emitToJob(job.id!, { type: 'JOB_PROCESSING', payload: {} });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    assignment.status = 'processing';
    await assignment.save();

    let fileContent = '';
    if (assignment.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), assignment.fileUrl);
        const fileExt = path.extname(filePath).toLowerCase();
        
        if (fileExt === '.pdf') {
          const dataBuffer = await fs.readFile(filePath);
          const data = await pdfParse(dataBuffer);
          fileContent = data.text;
        } else if (fileExt === '.txt') {
          fileContent = await fs.readFile(filePath, 'utf-8');
        }
      } catch (err) {
        console.warn('Failed to read file content:', err);
      }
    }

    try {
      const generatedData = await aiService.generateQuestions(assignment, fileContent);

      const paper = new GeneratedPaper({
        assignmentId: assignment._id,
        sections: generatedData.sections,
        answerKey: generatedData.answerKey,
        totalMarks: generatedData.totalMarks || assignment.questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0),
        totalQuestions: generatedData.totalQuestions || assignment.questionTypes.reduce((sum, qt) => sum + qt.count, 0),
      });

      await paper.save();

      assignment.status = 'completed';
      await assignment.save();

      // Cache result
      try {
        await redis.setex(`paper:${assignment._id}`, 3600, JSON.stringify(paper));
      } catch (redisErr) {
        console.warn('Failed to cache paper to Redis:', redisErr);
      }

      emitToJob(job.id!, { type: 'JOB_COMPLETE', payload: { assignmentId: assignment._id } });

      return paper;
    } catch (error) {
      assignment.status = 'failed';
      await assignment.save();
      emitToJob(job.id!, { type: 'JOB_FAILED', payload: { error: 'Failed to generate questions' } });
      throw error;
    }
  },
  {
    connection: {
      url: env.REDIS_URL,
    },
  }
);

questionWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
