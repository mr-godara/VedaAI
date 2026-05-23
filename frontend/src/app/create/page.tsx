'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAssignmentStore } from '@/store/assignmentStore';
import { createAssignment, uploadFile } from '@/lib/api';
import type { QuestionTypeConfig } from '@/types';
import QuestionTypeSection from '@/components/QuestionTypeSection';
import StepProgressBar from '@/components/StepProgressBar';
import {
  CloudUpload,
  Calendar,
  Plus,
  X,
  Minus,
  ChevronLeft,
  ChevronRight,
  Mic,
  ChevronDown,
} from 'lucide-react';

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'True/False',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { formData, setFormData, resetForm, setCurrentJobId, setCurrentAssignmentId, setJobStatus } = useAssignmentStore();

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const totalQuestions = formData.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = formData.questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0);

  /* ========== File Upload Handlers ========== */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'File size must be under 10MB' }));
      return;
    }
    setUploading(true);
    setErrors((prev) => ({ ...prev, file: '' }));
    try {
      const result = await uploadFile(file);
      setFormData({ fileUrl: result.fileUrl, fileName: result.fileName });
    } catch {
      // Fallback: save name locally if API fails
      setFormData({ fileName: file.name });
    } finally {
      setUploading(false);
    }
  };

  /* ========== Question Type Handlers ========== */
  const addQuestionType = () => {
    const usedTypes = formData.questionTypes.map((qt) => qt.type);
    const availableType = QUESTION_TYPE_OPTIONS.find((t) => !usedTypes.includes(t));
    if (availableType) {
      setFormData({
        questionTypes: [
          ...formData.questionTypes,
          { type: availableType, count: 4, marks: 1 },
        ],
      });
    }
  };

  const removeQuestionType = (index: number) => {
    const updated = formData.questionTypes.filter((_, i) => i !== index);
    setFormData({ questionTypes: updated });
  };

  const updateQuestionType = (index: number, field: keyof QuestionTypeConfig, value: string | number) => {
    const updated = [...formData.questionTypes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ questionTypes: updated });
  };

  const incrementValue = (index: number, field: 'count' | 'marks') => {
    const current = formData.questionTypes[index][field];
    const max = field === 'count' ? 50 : 100;
    if (current < max) {
      updateQuestionType(index, field, current + 1);
    }
  };

  const decrementValue = (index: number, field: 'count' | 'marks') => {
    const current = formData.questionTypes[index][field];
    if (current > 1) {
      updateQuestionType(index, field, current - 1);
    }
  };

  /* ========== Validation & Submit ========== */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Assignment Name is required';
    }
    if (!formData.subject?.trim()) {
      newErrors.subject = 'Subject/Topic is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due Date is required';
    }
    if (formData.questionTypes.length === 0) {
      newErrors.questionTypes = 'At least one question type is required';
    }
    formData.questionTypes.forEach((qt, i) => {
      if (qt.count < 1) newErrors[`qt_count_${i}`] = 'Min 1';
      if (qt.marks < 1) newErrors[`qt_marks_${i}`] = 'Min 1';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setServerWaking(false);
    // Show wake-up banner after 4s if still waiting
    const wakeTimer = setTimeout(() => setServerWaking(true), 4000);
    try {
      const payload = {
        ...formData,
        title: formData.title,
        subject: formData.subject,
        dueDate: formData.dueDate,
      };

      const result = await createAssignment(payload);
      clearTimeout(wakeTimer);
      setCurrentAssignmentId(result.assignmentId);
      setCurrentJobId(result.jobId);
      setJobStatus('queued');
      resetForm();
      router.push(`/assignments/${result.assignmentId}/status`);
    } catch (error) {
      clearTimeout(wakeTimer);
      setServerWaking(false);
      console.error('Failed to create assignment:', error);
      setErrors({ submit: 'Failed to create assignment. The server may have timed out — please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Assignment" showBack>
      <div className="p-2 md:p-6 max-w-4xl mx-auto animate-fade-in pb-16">
        
        {/* Page Title Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-sm"></span>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight font-outfit">
              Create Assignment
            </h1>
          </div>
          <p className="text-xs md:text-sm text-text-secondary ml-[18px]">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Single Page Form Container */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm mb-8">
          
          <StepProgressBar />

          {/* Assignment Details Title */}
          <div className="mb-6">
            <h2 className="text-base md:text-lg font-bold text-text-primary mb-1 font-outfit">
              Assignment Details
            </h2>
            <p className="text-xs md:text-sm text-text-secondary">
              Basic information about your assignment
            </p>
          </div>

          {/* File Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-colors mb-3 ${
              dragActive
                ? 'border-primary bg-primary-light'
                : 'border-gray-250 bg-gray-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <CloudUpload className="w-10 h-10 text-text-muted mb-3 stroke-[1.5px]" />
              {formData.fileName ? (
                <div className="animate-fade-in">
                  <p className="text-sm font-bold text-text-primary mb-1.5 truncate max-w-xs">{formData.fileName}</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ fileUrl: undefined, fileName: undefined })}
                    className="text-xs font-bold text-danger hover:underline cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-text-primary mb-1">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-text-muted mb-4">PDF, TXT, images up to 10MB</p>
                  <label className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-text-primary hover:bg-gray-50 cursor-pointer transition-all active:scale-95 shadow-sm bg-white">
                    {uploading ? 'Uploading...' : 'Browse Files'}
                    <input
                      type="file"
                      accept=".pdf,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-text-muted text-center mb-6">
            Upload images of your preferred document/image
          </p>
          {errors.file && (
            <p className="text-xs text-danger text-center mt-1 mb-4 font-semibold">{errors.file}</p>
          )}

          {/* Form Fields: Name, Topic, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div>
              <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider mb-2 font-outfit">
                Assignment Name
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ title: e.target.value })}
                placeholder="e.g. Quiz on Electricity"
                className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary bg-white focus:outline-none focus:border-primary transition-all font-medium ${
                  errors.title ? 'border-danger' : 'border-gray-200'
                }`}
              />
              {errors.title && <p className="text-[10px] text-danger mt-1 font-bold">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider mb-2 font-outfit">
                Subject / Topic
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData({ subject: e.target.value })}
                placeholder="e.g. Science - Electricity"
                className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary bg-white focus:outline-none focus:border-primary transition-all font-medium ${
                  errors.subject ? 'border-danger' : 'border-gray-200'
                }`}
              />
              {errors.subject && <p className="text-[10px] text-danger mt-1 font-bold">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider mb-2 font-outfit">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ dueDate: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl text-sm text-text-primary bg-white focus:outline-none focus:border-primary transition-all appearance-none font-medium ${
                    errors.dueDate ? 'border-danger' : 'border-gray-200'
                  }`}
                />
                <Calendar className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none stroke-[2px]" />
              </div>
              {errors.dueDate && <p className="text-[10px] text-danger mt-1 font-bold">{errors.dueDate}</p>}
            </div>
          </div>

          <hr className="border-t border-gray-100 my-8" />

          {/* Question Type Section */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-text-primary mb-4 font-outfit">
              Question Type
            </h3>
            <QuestionTypeSection />
            {errors.questionTypes && (
              <p className="text-xs text-danger mt-3 font-semibold">{errors.questionTypes}</p>
            )}
          </div>

          <hr className="border-t border-gray-100 my-8" />

          {/* Additional Information textarea */}
          <div>
            <label className="block text-xs font-extrabold text-text-primary uppercase tracking-wider mb-2 font-outfit">
              Additional Information (For better output)
            </label>
            <div className="relative">
              <textarea
                value={formData.additionalInstructions || ''}
                onChange={(e) => setFormData({ additionalInstructions: e.target.value })}
                placeholder="e.g. Generate a question paper for a 3 hour exam duration matching CBSE patterns..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-text-primary bg-white focus:outline-none focus:border-primary transition-all resize-none font-medium pr-10"
              />
              <button 
                type="button" 
                className="absolute right-3.5 bottom-3.5 text-text-muted hover:text-text-secondary transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Global errors */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-danger">
            {errors.submit}
          </div>
        )}

        {/* Server waking up banner */}
        {serverWaking && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">Server is waking up — this may take 30–60 seconds on first use. Please wait...</p>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-3 border border-gray-250 hover:bg-gray-50 rounded-full text-xs font-bold text-text-primary uppercase tracking-wider shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
            Previous
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-7 py-3 bg-[#111111] hover:bg-[#222222] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 border border-white/5 cursor-pointer"
          >
            {submitting ? (serverWaking ? 'Waking server...' : 'Creating...') : 'Next'}
            {!submitting && <ChevronRight className="w-4 h-4 stroke-[2.5px]" />}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
