import mongoose, { Schema } from 'mongoose';
import { IAssignment } from '../types';

const QuestionTypeSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true },
}, { _id: false });

const AssignmentSchema: Schema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  fileUrl: { type: String },
  dueDate: { type: Date, required: true },
  questionTypes: [QuestionTypeSchema],
  additionalInstructions: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  jobId: { type: String },
}, {
  timestamps: true,
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
