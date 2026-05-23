'use client';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'moderate' | 'hard';
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const getStyles = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStyles()}`}
    >
      {difficulty}
    </span>
  );
}
