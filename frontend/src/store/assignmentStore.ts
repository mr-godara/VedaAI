import { create } from 'zustand';
import type { Assignment, AssignmentFormData, GeneratedPaper, JobStatus, QuestionTypeConfig } from '@/types';

const defaultQuestionTypes: QuestionTypeConfig[] = [
  { type: 'Multiple Choice Questions', count: 4, marks: 1 },
];

const defaultFormData: AssignmentFormData = {
  title: '',
  subject: '',
  fileUrl: undefined,
  fileName: undefined,
  dueDate: '',
  questionTypes: defaultQuestionTypes,
  additionalInstructions: '',
};

interface AssignmentStore {
  // Form state
  formData: AssignmentFormData;
  setFormData: (data: Partial<AssignmentFormData>) => void;
  resetForm: () => void;

  // Assignments list
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;

  // Current result
  currentResult: GeneratedPaper | null;
  setCurrentResult: (result: GeneratedPaper | null) => void;

  // Current assignment detail
  currentAssignment: Assignment | null;
  setCurrentAssignment: (assignment: Assignment | null) => void;

  // Job/WebSocket state
  jobStatus: JobStatus;
  setJobStatus: (status: JobStatus) => void;
  currentJobId: string | null;
  setCurrentJobId: (jobId: string | null) => void;
  currentAssignmentId: string | null;
  setCurrentAssignmentId: (id: string | null) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  // Form state
  formData: { ...defaultFormData },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () => set({ formData: { ...defaultFormData, questionTypes: [...defaultQuestionTypes.map(q => ({...q}))] } }),

  // Assignments list
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments],
    })),
  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
    })),

  // Current result
  currentResult: null,
  setCurrentResult: (result) => set({ currentResult: result }),

  // Current assignment
  currentAssignment: null,
  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

  // Job state
  jobStatus: 'idle',
  setJobStatus: (status) => set({ jobStatus: status }),
  currentJobId: null,
  setCurrentJobId: (jobId) => set({ currentJobId: jobId }),
  currentAssignmentId: null,
  setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),
}));
