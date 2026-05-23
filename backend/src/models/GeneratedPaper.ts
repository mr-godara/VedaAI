import mongoose, { Schema } from 'mongoose';
import { IGeneratedPaper } from '../types';

const QuestionSchema = new Schema({
  questionNumber: { type: Number, required: true },
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  marks: { type: Number, required: true },
  options: [{ type: String }],
}, { _id: false });

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String },
  questionType: { type: String, required: true },
  questions: [QuestionSchema],
}, { _id: false });

const AnswerKeyItemSchema = new Schema({
  questionNumber: { type: Number, required: true },
  answer: { type: String, required: true },
}, { _id: false });

const GeneratedPaperSchema: Schema = new Schema({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sections: [SectionSchema],
  answerKey: [AnswerKeyItemSchema],
  totalMarks: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  version: { type: Number, default: 1 },
}, {
  timestamps: { createdAt: 'generatedAt', updatedAt: false },
});

export const GeneratedPaper = mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
