'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  Plus,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'My Groups', href: '#groups', icon: Users },
  { label: 'Assignments', href: '/assignments', icon: FileText, badge: 0 },
  { label: "AI Teacher's Toolkit", href: '#toolkit', icon: Sparkles },
  { label: 'My Library', href: '#library', icon: BookOpen },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();

  const dynamicNavItems = navItems.map((item) => {
    if (item.href === '/assignments') {
      return { ...item, badge: assignments.length > 0 ? assignments.length : undefined };
    }
    return item;
  });

  return (
    <aside className="w-[260px] h-[calc(100vh-32px)] floating-card-sidebar flex flex-col z-35 relative md:sticky md:top-4">
      {/* Mobile Close Button */}
      <button 
        onClick={onClose} 
        className="md:hidden absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5 text-text-secondary" />
      </button>

      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-extrabold text-base font-outfit">V</span>
          </div>
          <span className="font-bold text-xl text-text-primary tracking-tight font-outfit">VedaAI</span>
        </div>
      </div>

      {/* Create Assignment Button */}
      <div className="px-5 pb-6">
        <Link
          href="/create"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 glowing-create-btn rounded-full font-semibold text-xs uppercase tracking-wider transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          Create Assignment
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {dynamicNavItems.map((item) => {
            const isActive =
              item.href === '/assignments'
                ? pathname.startsWith('/assignments') || pathname === '/create'
                : pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  href={item.href === '/assignments' ? '/' : item.href}
                  onClick={onClose}
                  prefetch={false}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all ${
                    isActive
                      ? 'text-text-primary font-bold bg-[#F2EDE9] text-[#C4704B]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#C4704B]' : 'text-text-muted'}`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[#FF4D4D] text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="px-4 pb-2 border-b border-border/40">
        <Link
          href="#settings"
          onClick={onClose}
          prefetch={false}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-5 h-5 text-text-muted" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* School Profile */}
      <div className="px-5 py-4 mt-auto">
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#E8DCC4] flex items-center justify-center shadow-inner">
            <span className="text-xs font-bold text-[#A46B3C]">DPS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text-primary truncate">Delhi Public School</p>
            <p className="text-[10px] font-semibold text-text-muted truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
