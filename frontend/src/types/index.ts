export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  fileUrl?: string;
  fileName?: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  fileUrl?: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  createdAt: string;
  updatedAt: string;
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

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  totalMarks: number;
  totalQuestions: number;
  generatedAt: string;
  version: number;
}

export type JobStatus = 'idle' | 'queued' | 'processing' | 'generating' | 'done' | 'failed';

export interface WSMessage {
  type: 'JOB_QUEUED' | 'JOB_PROCESSING' | 'JOB_COMPLETE' | 'JOB_FAILED';
  payload: {
    jobId: string;
    assignmentId: string;
    status: string;
    message: string;
  };
}
