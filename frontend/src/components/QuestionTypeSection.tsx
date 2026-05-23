'use client';

import { useAssignmentStore } from '@/store/assignmentStore';
import { ChevronDown, Plus } from 'lucide-react';

export interface QuestionTypeRow {
  id: string;
  type: string;
  questions: number;
  marks: number;
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer',
  'True / False',
  'Fill in the Blanks',
];

export default function QuestionTypeSection() {
  const { formData, setFormData } = useAssignmentStore();

  // Map Zustand store's format to the QuestionTypeRow interface
  const rows: QuestionTypeRow[] = formData.questionTypes.map((qt, index) => ({
    id: `${index}-${qt.type}`,
    type: qt.type,
    questions: qt.count,
    marks: qt.marks,
  }));

  const updateFormData = (updatedRows: QuestionTypeRow[]) => {
    setFormData({
      questionTypes: updatedRows.map((row) => ({
        type: row.type,
        count: row.questions,
        marks: row.marks,
      })),
    });
  };

  const handleRowChange = (index: number, field: keyof QuestionTypeRow, value: string | number) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value } as QuestionTypeRow;
    updateFormData(updated);
  };

  const handleIncrement = (index: number, field: 'questions' | 'marks') => {
    const updated = [...rows];
    const current = updated[index][field] as number;
    const max = field === 'questions' ? 50 : 100;
    if (current < max) {
      updated[index] = { ...updated[index], [field]: current + 1 } as QuestionTypeRow;
      updateFormData(updated);
    }
  };

  const handleDecrement = (index: number, field: 'questions' | 'marks') => {
    const updated = [...rows];
    const current = updated[index][field] as number;
    if (current > 1) {
      updated[index] = { ...updated[index], [field]: current - 1 } as QuestionTypeRow;
      updateFormData(updated);
    }
  };

  const handleAddRow = () => {
    const usedTypes = rows.map((r) => r.type);
    const availableType = QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.includes(t)) || QUESTION_TYPE_OPTIONS[0];
    const updated = [
      ...rows,
      {
        id: `${rows.length}-${availableType}`,
        type: availableType,
        questions: 4,
        marks: 1,
      },
    ];
    updateFormData(updated);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length > 1) {
      const updated = rows.filter((_, i) => i !== index);
      updateFormData(updated);
    }
  };

  const totalQuestions = rows.reduce((sum, r) => sum + r.questions, 0);
  const totalMarks = rows.reduce((sum, r) => sum + r.questions * r.marks, 0);

  const isOnlyRow = rows.length <= 1;

  return (
    <div className="w-full">
      {/* Column Headers (Desktop Only) */}
      <div className="hidden sm:flex items-center gap-4 w-full text-xs font-bold uppercase tracking-wider text-[#888] select-none mb-3 px-1">
        <div className="w-[calc(55%+48px)]">Question Type</div>
        <div className="w-[120px] text-center">No. of Questions</div>
        <div className="w-[120px] text-center">Marks</div>
      </div>

      {/* Rows Container */}
      <div className="flex flex-col gap-4 w-full mb-6">
        {rows.map((row, index) => (
          <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-4 w-full animate-fade-in">
            {/* Group 1: Dropdown + Remove button */}
            <div className="flex items-center gap-4 w-full sm:w-[calc(55%+48px)] flex-shrink-0">
              <div className="relative flex-1 sm:w-full">
                <select
                  value={row.type}
                  onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                  className="w-full h-[36px] bg-white text-sm font-semibold text-[#1a1a1a] focus:outline-none appearance-none pr-10 px-5 cursor-pointer shadow-none transition-all rounded-[9999px]"
                  style={{ border: '0.5px solid #e0e0e0' }}
                >
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none stroke-[2px]" />
              </div>

              {/* Remove button (X) */}
              <button
                type="button"
                onClick={() => handleRemoveRow(index)}
                disabled={isOnlyRow}
                className="w-8 h-[36px] flex items-center justify-center text-[#888] hover:text-danger disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xl font-light bg-transparent border-0 p-0"
              >
                &times;
              </button>
            </div>

            {/* Group 2: Steppers */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Stepper 1: No. of Questions */}
              <div
                className="flex items-center justify-between bg-white px-4 h-[36px] w-[120px] flex-shrink-0 rounded-[9999px]"
                style={{ border: '0.5px solid #e0e0e0' }}
              >
                <button
                  type="button"
                  onClick={() => handleDecrement(index, 'questions')}
                  className="text-[#888] hover:text-[#1a1a1a] active:scale-75 transition-all text-base font-medium cursor-pointer bg-transparent border-0 p-0"
                >
                  &minus;
                </button>
                <span className="text-sm font-medium text-[#1a1a1a] select-none">
                  {row.questions}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement(index, 'questions')}
                  className="text-[#888] hover:text-[#1a1a1a] active:scale-75 transition-all text-base font-medium cursor-pointer bg-transparent border-0 p-0"
                >
                  +
                </button>
              </div>

              {/* Stepper 2: Marks */}
              <div
                className="flex items-center justify-between bg-white px-4 h-[36px] w-[120px] flex-shrink-0 rounded-[9999px]"
                style={{ border: '0.5px solid #e0e0e0' }}
              >
                <button
                  type="button"
                  onClick={() => handleDecrement(index, 'marks')}
                  className="text-[#888] hover:text-[#1a1a1a] active:scale-75 transition-all text-base font-medium cursor-pointer bg-transparent border-0 p-0"
                >
                  &minus;
                </button>
                <span className="text-sm font-medium text-[#1a1a1a] select-none">
                  {row.marks}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement(index, 'marks')}
                  className="text-[#888] hover:text-[#1a1a1a] active:scale-75 transition-all text-base font-medium cursor-pointer bg-transparent border-0 p-0"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button & Totals Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
        {/* Add Question Button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a] hover:opacity-85 transition-opacity p-0 bg-transparent border-0 cursor-pointer select-none"
        >
          <div className="w-[36px] h-[36px] rounded-full bg-[#111111] flex items-center justify-center shadow-none flex-shrink-0">
            <Plus className="w-4 h-4 text-white stroke-[2.5px]" />
          </div>
          Add Question Type
        </button>

        {/* Totals Section */}
        <div className="flex flex-col items-end gap-1 font-outfit select-none sm:text-right">
          <div className="text-sm font-medium text-[#888]">
            Total Questions : <span className="font-bold text-[#1a1a1a] ml-1">{totalQuestions}</span>
          </div>
          <div className="text-sm font-medium text-[#888]">
            Total Marks : <span className="font-bold text-[#1a1a1a] ml-1">{totalMarks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
