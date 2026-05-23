import { z } from 'zod';
import { Document, Types } from 'mongoose';

export const QuestionTypeInputSchema = z.object({
  type: z.string(),
  count: z.number().min(1),
  marks: z.number().min(1),
});

export const AssignmentInputSchema = z.object({
  title: z.string().min(3),
  subject: z.string().min(1),
  fileUrl: z.string().optional(),
  dueDate: z.string().or(z.date()),
  questionTypes: z.array(QuestionTypeInputSchema).min(1),
  additionalInstructions: z.string().max(500).optional(),
});

export type AssignmentInput = z.infer<typeof AssignmentInputSchema>;

export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  fileUrl?: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  instruction: string;
  questionType: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  questionNumber: number;
  answer: string;
}

export interface IGeneratedPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  totalMarks: number;
  totalQuestions: number;
  generatedAt: Date;
  version: number;
}

export type JobStatus = 'idle' | 'queued' | 'processing' | 'generating' | 'done' | 'failed';
