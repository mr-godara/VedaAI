'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignment } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { key: 'queued', label: 'Queued', description: 'Assignment is in the queue' },
  { key: 'processing', label: 'Processing', description: 'Analyzing your requirements' },
  { key: 'generating', label: 'Generating Questions', description: 'AI is creating questions' },
  { key: 'done', label: 'Done', description: 'Your question paper is ready!' },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StatusPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    jobStatus,
    setJobStatus,
    currentJobId,
    currentAssignment,
    setCurrentAssignment,
  } = useAssignmentStore();

  useEffect(() => {
    // Fetch assignment details
    getAssignment(id)
      .then((assignment) => {
        setCurrentAssignment(assignment);
        if (assignment.status === 'completed') {
          setJobStatus('done');
          setTimeout(() => router.push(`/assignments/${id}/result`), 1500);
          return;
        }
        if (assignment.jobId) {
          connectWebSocket(assignment.jobId);
        }
      })
      .catch(console.error);

    return () => {
      wsClient.disconnect();
    };
  }, [id]);

  function connectWebSocket(jobId: string) {
    wsClient.connect(jobId);
    wsClient.onMessage((message) => {
      switch (message.type) {
        case 'JOB_QUEUED':
          setJobStatus('queued');
          break;
        case 'JOB_PROCESSING':
          setJobStatus('processing');
          break;
        case 'JOB_COMPLETE':
          setJobStatus('done');
          setTimeout(() => {
            router.push(`/assignments/${id}/result`);
          }, 1500);
          break;
        case 'JOB_FAILED':
          setJobStatus('failed');
          break;
      }
    });
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === jobStatus);

  return (
    <AppLayout title="Assignment" showBack>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-8">
        <div className="bg-white rounded-xl border border-border p-10 max-w-lg w-full animate-fade-in">
          <h2 className="text-xl font-semibold text-text-primary text-center mb-2">
            Generating Your Assessment
          </h2>
          <p className="text-sm text-text-secondary text-center mb-10">
            {currentAssignment?.title || 'Please wait while we create your question paper...'}
          </p>

          {/* Step Indicator */}
          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  {/* Connector Line + Icon */}
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                        <Circle className="w-4 h-4 text-text-muted" />
                      </div>
                    )}
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-10 ${
                          isCompleted ? 'bg-success' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="pt-1 pb-6">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent
                          ? 'text-text-primary'
                          : 'text-text-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Failed State */}
          {jobStatus === 'failed' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-danger font-medium">Generation failed</p>
              <p className="text-xs text-text-secondary mt-1">
                Something went wrong. Please try again.
              </p>
              <button
                onClick={() => router.push('/create')}
                className="mt-3 px-4 py-2 bg-dark-cta text-white rounded-lg text-sm font-medium hover:bg-dark-cta-hover transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
