'use client';

import { ArrowLeft, Bell, ChevronDown, FileText, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({ title = 'Assignment', showBack = false, onMenuToggle }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 floating-card-header bg-white flex items-center justify-between px-5 md:px-6 mx-0 md:mx-4 mt-0 md:mt-4 z-20 sticky top-0 md:top-4 transition-all">
      {/* Left section / Mobile Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo, only shown on small screens */}
        <div className="flex md:hidden items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs font-outfit">V</span>
          </div>
          <span className="font-extrabold text-base text-text-primary tracking-tight font-outfit">VedaAI</span>
        </div>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors mr-1"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
            </button>
          )}
          <div className="flex items-center gap-2 text-text-secondary">
            <FileText className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-semibold text-text-muted">/</span>
            <span className="text-sm font-bold text-text-primary font-outfit">{title}</span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notification Bell */}
        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-full transition-all relative">
          <Bell className="w-5 h-5 stroke-[2.2px] text-text-primary" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF4D4D] rounded-full border border-white"></span>
        </button>
        
        {/* User Profile avatar */}
        <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#E5D5C5] flex items-center justify-center shadow-sm">
            <span className="text-primary text-xs font-bold font-outfit">JD</span>
          </div>
          <span className="hidden md:inline text-text-primary text-sm font-bold font-outfit">John Doe</span>
          <ChevronDown className="hidden md:inline w-4 h-4 text-text-muted stroke-[2px]" />
        </div>

        {/* Mobile Hamburger toggle (positioned on far right, after profile) */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-1.5 text-text-primary hover:bg-gray-100 rounded-lg transition-colors ml-1"
        >
          <Menu className="w-5 h-5 stroke-[2.5px]" />
        </button>
      </div>
    </header>
  );
}
