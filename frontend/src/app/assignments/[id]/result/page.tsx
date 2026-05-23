'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignment, getResult, regenerateAssignment, downloadPdf } from '@/lib/api';
import type { GeneratedPaper, Assignment } from '@/types';
import {
  Download,
  RefreshCw,
  Pencil,
  Loader2,
  FileText,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { setCurrentResult, setFormData, setJobStatus, setCurrentJobId, setCurrentAssignmentId } = useAssignmentStore();

  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const [assignmentData, paperData] = await Promise.all([
        getAssignment(id),
        getResult(id),
      ]);
      setAssignment(assignmentData);
      setPaper(paperData);
      setCurrentResult(paperData);
    } catch (error) {
      console.error('Failed to fetch result:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const result = await regenerateAssignment(id);
      setCurrentJobId(result.jobId);
      setCurrentAssignmentId(id);
      setJobStatus('queued');
      router.push(`/assignments/${id}/status`);
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const blob = await downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assignment?.title || 'Assessment'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback: use html2pdf.js
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('exam-paper');
        if (element) {
          html2pdf()
            .set({
              margin: 10,
              filename: `${assignment?.title || 'Assessment'}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(element)
            .save();
        }
      } catch (fallbackError) {
        console.error('PDF fallback also failed:', fallbackError);
      }
    } finally {
      setDownloading(false);
    }
  }

  function handleEdit() {
    if (assignment) {
      setFormData({
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.dueDate.split('T')[0],
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions,
      });
      router.push('/create');
    }
  }

  if (loading) {
    return (
      <AppLayout title="Assignment" showBack>
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!paper || !assignment) {
    return (
      <AppLayout title="Assignment" showBack>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
          <p className="text-text-secondary mb-4 font-semibold">No result found for this assignment.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-[#111111] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Assignment" showBack>
      <div className="p-2 md:p-6 animate-fade-in max-w-4xl mx-auto pb-16">
        
        {/* Figma dark AI response header banner */}
        <div className="bg-[#1E1E1E] text-white rounded-2xl p-5 md:p-6 mb-6 shadow-md border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs md:text-sm font-semibold leading-relaxed tracking-wide opacity-90">
              Certainly, Teacher! Here are the customized Question Papers for your{' '}
              <span className="text-primary font-bold">{assignment.subject}</span> classes:
            </p>
          </div>
          
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-gray-100 rounded-full font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap active:scale-95 shadow-lg shadow-black/20"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-black stroke-[2.5px]" />
            )}
            Download as PDF
          </button>
        </div>

        {/* Secondary Action Toolbar */}
        <div className="flex items-center justify-end gap-3 mb-6 no-print">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-text-primary uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5px]" />
            )}
            Regenerate
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-text-primary uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2.5px]" />
            Edit Assignment
          </button>
        </div>

        {/* Floating high-fidelity Exam Paper */}
        <div
          id="exam-paper"
          className="bg-white rounded-3xl border border-gray-100 shadow-md max-w-4xl mx-auto overflow-hidden"
        >
          <ExamPaper paper={paper} assignment={assignment} />
        </div>
      </div>
    </AppLayout>
  );
}

/* ========== Exam Paper Component ========== */
interface ExamPaperProps {
  paper: GeneratedPaper;
  assignment: Assignment;
}

function ExamPaper({ paper, assignment }: ExamPaperProps) {
  const totalMarks = paper.totalMarks;

  return (
    <div className="p-8 md:p-12 font-serif text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* School Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide uppercase">Delhi Public School, Sector-4, Bokaro</h1>
        <p className="text-base md:text-lg mt-1 font-semibold">
          Subject: {assignment.subject}
        </p>
        <p className="text-sm font-semibold text-text-secondary mt-0.5">Class: 5th</p>
      </div>

      {/* Time & Marks Row */}
      <div className="flex justify-between items-center mb-5 text-sm md:text-base font-semibold border-b border-gray-250 pb-2">
        <span>Time Allowed: 45 minutes</span>
        <span>Maximum Marks: {totalMarks}</span>
      </div>

      <p className="text-sm italic mb-6">All questions are compulsory unless stated otherwise.</p>

      {/* Student Details Blank Fields */}
      <div className="mb-8 text-sm md:text-base space-y-2 border border-gray-200 p-4 rounded-xl max-w-md bg-gray-50/50">
        <div className="flex gap-4">
          <span className="font-bold text-text-secondary">Name:</span>
          <span className="flex-1 border-b border-dashed border-gray-400"></span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold text-text-secondary">Roll Number:</span>
          <span className="flex-1 border-b border-dashed border-gray-400"></span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold text-text-secondary">Section:</span>
          <span className="flex-1 border-b border-dashed border-gray-400"></span>
        </div>
      </div>

      {/* Sections rendering */}
      {paper.sections.map((section, sectionIndex) => {
        const sectionLetter = String.fromCharCode(65 + sectionIndex); // A, B, C...

        return (
          <div key={sectionIndex} className="mb-8 animate-fade-in">
            {/* Section Header */}
            <h2 className="text-center text-base md:text-lg font-bold border-y border-gray-300 py-1.5 mb-4 tracking-wider bg-gray-50/70">
              Section {sectionLetter}
            </h2>

            {/* Section Title & Instructions */}
            <div className="mb-5 bg-gray-50/30 p-2.5 rounded-lg border-l-4 border-gray-400">
              <p className="text-sm md:text-base font-extrabold text-black uppercase tracking-wide">
                {section.questionType}
              </p>
              <p className="text-xs md:text-sm italic text-text-secondary mt-1 font-medium">
                {section.instruction || `Attempt all questions. Each question carries ${section.questions[0]?.marks || 1} marks.`}
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {section.questions.map((question) => (
                <div key={question.questionNumber} className="text-sm md:text-base">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="leading-relaxed text-black">
                        <span className="font-bold">{question.questionNumber}.</span>{' '}
                        {question.text}
                      </p>

                      {/* MCQ Options grid */}
                      {question.options && question.options.length > 0 && (
                        <div className="ml-6 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          {question.options.map((option, optIdx) => (
                            <p key={optIdx} className="text-xs md:text-sm font-medium">
                              <span className="font-bold">({String.fromCharCode(97 + optIdx)})</span> {option}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Question Marks indicator */}
                    <span className="text-xs font-bold text-text-secondary whitespace-nowrap bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="border-t border-gray-300 my-8 pt-4">
        <p className="text-center text-sm md:text-base font-bold text-text-secondary uppercase tracking-widest">End of Question Paper</p>
      </div>

      {/* Answer Key */}
      {paper.answerKey && paper.answerKey.length > 0 && (
        <div className="mt-12 pt-8 border-t border-dashed border-gray-300">
          <h3 className="text-base md:text-lg font-bold mb-5 uppercase tracking-wide text-text-primary">Answer Key:</h3>
          <div className="space-y-4 text-sm md:text-base bg-gray-50/30 p-6 rounded-2xl border border-gray-150">
            {paper.answerKey.map((item) => (
              <div key={item.questionNumber} className="leading-relaxed border-b border-gray-100/50 pb-2.5 last:border-0 last:pb-0">
                <p className="text-black">
                  <span className="font-bold text-text-secondary">Q{item.questionNumber}.</span>{' '}
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
