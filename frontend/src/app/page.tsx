'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getAssignments, deleteAssignment } from '@/lib/api';
import type { Assignment } from '@/types';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
} from 'lucide-react';

export default function DashboardPage() {
  const { assignments, setAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch {
      // API might not be running yet, show empty state
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter((a) => a._id !== id));
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
    setMenuOpen(null);
  }

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout title="Assignment">
        <div className="p-4 md:p-6">
          <LoadingSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (assignments.length === 0) {
    return <EmptyState />;
  }

  return (
    <AppLayout title="Assignment">
      <div className="p-2 md:p-6 animate-fade-in relative min-h-[calc(100vh-120px)] flex flex-col">
        {/* Page Title with Green Dot */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-sm"></span>
              <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight font-outfit">
                Assignments
              </h1>
            </div>
            <p className="text-xs md:text-sm text-text-secondary ml-[18px]">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar - Full Width with Floating aesthetics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-text-muted" />
            Filter
          </button>
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search Assignment"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-[#F9F9F9] focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Assignment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-24">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              menuOpen={menuOpen === assignment._id}
              onMenuToggle={() =>
                setMenuOpen(menuOpen === assignment._id ? null : assignment._id)
              }
              onView={() => {
                if (assignment.status === 'completed') {
                  router.push(`/assignments/${assignment._id}/result`);
                } else {
                  router.push(`/assignments/${assignment._id}/status`);
                }
                setMenuOpen(null);
              }}
              onDelete={() => handleDelete(assignment._id)}
            />
          ))}
        </div>

        {/* Bottom Centered Create Button on Desktop (renders in natural page flow) */}
        <div className="hidden md:flex justify-center mt-10 mb-8">
          <Link
            href="/create"
            className="flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#222222] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-white/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" />
            Create Assignment
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

/* ========== Empty State Component ========== */
function EmptyState() {
  return (
    <AppLayout title="Assignment">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6 py-12 animate-fade-in">
        {/* Illustration */}
        <div className="mb-6 transform hover:scale-[1.02] transition-transform">
          <EmptyIllustration />
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-3 font-outfit text-center">
          No assignments yet
        </h2>
        <p className="text-xs md:text-sm text-text-secondary text-center max-w-md mb-8 leading-relaxed px-4">
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria, and let AI
          assist with grading.
        </p>
        
        <Link
          href="/create"
          className="flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#222222] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          Create Your First Assignment
        </Link>
      </div>
    </AppLayout>
  );
}

/* ========== Empty State Illustration ========== */
function EmptyIllustration() {
  return (
    <svg width="180" height="150" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="75" r="55" fill="#EBEBEB" />
      {/* Magnifying glass background glow */}
      <circle cx="90" cy="70" r="35" stroke="#FFFFFF" strokeWidth="4" fill="#F4F4F4" />
      {/* Document handle */}
      <line x1="114" y1="94" x2="138" y2="118" stroke="#D1D1D1" strokeWidth="5" strokeLinecap="round" />
      {/* Circular target area */}
      <circle cx="90" cy="70" r="18" fill="#FEE2E2" />
      <path d="M82 62L98 78M98 62L82 78" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      {/* Decorative sparkles */}
      <circle cx="145" cy="50" r="3" fill="#C4704B" opacity="0.7" />
      <circle cx="40" cy="90" r="2.5" fill="#C4704B" opacity="0.5" />
      {/* Floppy page illustration */}
      <rect x="58" y="32" width="22" height="30" rx="3" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1.5" />
      <line x1="63" y1="40" x2="75" y2="40" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
      <line x1="63" y1="47" x2="71" y2="47" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
      <line x1="63" y1="54" x2="73" y2="54" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ========== Assignment Card ========== */
interface AssignmentCardProps {
  assignment: Assignment;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onView: () => void;
  onDelete: () => void;
}

function AssignmentCard({
  assignment,
  menuOpen,
  onMenuToggle,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 relative animate-fade-in hover:shadow-md hover:border-gray-200/80 transition-all duration-300 ${menuOpen ? 'z-30' : 'z-0'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-extrabold text-text-primary text-base md:text-lg mb-4 tracking-tight truncate font-outfit">
            {assignment.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-text-secondary">
            <span>
              <span className="text-text-muted">Assigned on:</span>{' '}
              {formatDate(assignment.createdAt)}
            </span>
            <span className="hidden sm:inline text-text-muted">•</span>
            <span>
              <span className="text-text-muted">Due:</span>{' '}
              {formatDate(assignment.dueDate)}
            </span>
          </div>
        </div>

        {/* Menu Button */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
        >
          <MoreVertical className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onMenuToggle} />
          <div className="absolute right-5 top-14 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-20 overflow-hidden animate-fade-in w-44">
            <button
              onClick={onView}
              className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-primary hover:bg-gray-50 w-full text-left transition-colors"
            >
              <Eye className="w-4 h-4 text-text-muted" />
              View Assignment
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-[#FF4D4D] hover:bg-red-50 w-full text-left transition-colors border-t border-gray-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ========== Loading Skeleton ========== */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded-lg w-40 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded-lg w-64"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-32">
            <div className="h-5 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-100 rounded-lg w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
