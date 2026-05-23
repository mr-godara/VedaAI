'use client';

import { useAssignmentStore } from '@/store/assignmentStore';

export default function StepProgressBar() {
  const { jobStatus } = useAssignmentStore();

  const isComplete = jobStatus === 'done';
  const progress = isComplete ? 100 : 50;

  return (
    <div className="w-full mb-6">
      {/* Bar Container */}
      <div className="relative w-full h-[10px] flex items-center">
        {/* Background Track */}
        <div className="absolute w-full h-[4px] bg-[#e5e5e5] rounded-full overflow-hidden">
          {/* Active Fill */}
          <div
            className="h-full bg-[#1a1a1a] rounded-full transition-all duration-600 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Center Node */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full transition-colors duration-600 z-10 ${
            isComplete
              ? 'bg-[#1a1a1a] border-[2px] border-[#1a1a1a]'
              : 'bg-white border-[2px] border-[#1a1a1a]'
          }`}
        />
      </div>

      {/* Labels below the bar */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[12px] font-bold text-text-primary">
          Assignment Details
        </span>
        <span
          className={`text-[12px] font-bold transition-colors duration-600 ${
            isComplete ? 'text-text-primary' : 'text-text-muted'
          }`}
        >
          Generated
        </span>
      </div>
    </div>
  );
}
