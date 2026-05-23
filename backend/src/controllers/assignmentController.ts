import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment';
import { GeneratedPaper } from '../models/GeneratedPaper';
import { questionQueue } from '../queues/questionQueue';
import { redis } from '../config/redis';
import { generatePdf } from '../services/pdfService';

export const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[DEBUG] createAssignment started');
    const data = req.body;
    
    const newAssignment = new Assignment({
      ...data,
      status: 'pending',
    });

    console.log('[DEBUG] Saving new assignment to MongoDB...');
    await newAssignment.save();
    console.log('[DEBUG] Successfully saved assignment to MongoDB:', newAssignment._id);

    console.log('[DEBUG] Adding job to Redis queue...');
    const job = await questionQueue.add('generate-questions', {
      assignmentId: newAssignment._id,
    });
    console.log('[DEBUG] Successfully added job to Redis queue:', job.id);

    newAssignment.jobId = job.id;
    console.log('[DEBUG] Updating assignment with jobId...');
    await newAssignment.save();
    console.log('[DEBUG] Successfully updated assignment. Sending response.');

    res.status(201).json({
      assignmentId: newAssignment._id,
      jobId: job.id,
    });
  } catch (error) {
    console.error('[DEBUG] Error inside createAssignment:', error);
    next(error);
  }
};

export const getAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    next(error);
  }
};

export const getResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Check Redis cache first
    const cacheKey = `paper:${id}`;
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (redisErr) {
      console.warn('Redis cache miss/error:', redisErr);
      // Fallback to DB smoothly
    }
    
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const paper = await GeneratedPaper.findOne({ assignmentId: id });
    
    if (!paper) {
      return res.status(404).json({ error: 'Generated paper not found' });
    }

    // Cache the result for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(paper));

    res.status(200).json(paper);
  } catch (error) {
    next(error);
  }
};

export const regenerateAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = 'pending';
    await assignment.save();

    const job = await questionQueue.add('generate-questions', {
      assignmentId: assignment._id,
    });

    assignment.jobId = job.id;
    await assignment.save();
    
    // Invalidate cache
    await redis.del(`paper:${id}`);

    res.status(200).json({
      assignmentId: assignment._id,
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const paper = await GeneratedPaper.findOne({ assignmentId: id });
    const assignment = await Assignment.findById(id);
    
    if (!paper || !assignment) {
      return res.status(404).json({ error: 'Paper or Assignment not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${assignment.title}.pdf"`);
    
    const doc = generatePdf(paper, assignment, res);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const assignment = await Assignment.findByIdAndDelete(id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      await GeneratedPaper.deleteMany({ assignmentId: id });
      await redis.del(`paper:${id}`);
  
      res.status(200).json({ message: 'Assignment deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
