'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, BookOpen, Sparkles, Plus } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function AppLayout({ children, title, showBack }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const bottomNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Assignments', href: '/assignments', icon: FileText },
    { label: 'Library', href: '/library', icon: BookOpen },
    { label: 'AI Toolkit', href: '/toolkit', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row p-0 md:p-4 gap-0 md:gap-4 font-sans">
      
      {/* Sidebar - Desktop (shows floating card) or Mobile Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[260px] md:w-auto
      `}>
        {/* Backdrop for mobile */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Actual Sidebar Component */}
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          title={title} 
          showBack={showBack} 
          onMenuToggle={toggleMobileMenu} 
        />
        
        {/* Page Content */}
        <main className="flex-1 mt-4 md:mt-2 px-4 md:px-0 pb-24 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Action Button (FAB) on Mobile */}
      <button
        onClick={() => router.push('/create')}
        className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full bg-white text-[#C4704B] shadow-lg border border-gray-100 flex items-center justify-center z-40 transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6 stroke-[3px]" />
      </button>

      {/* Floating Bottom Nav Bar on Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-[#1A1A1A] rounded-[24px] h-14 flex items-center justify-around px-4 z-40 shadow-2xl border border-white/5">
        {bottomNavItems.map((item) => {
          const isActive = 
            item.href === '/assignments' 
              ? pathname.startsWith('/assignments') || pathname === '/create'
              : item.href === '/' 
                ? pathname === '/' 
                : pathname === item.href;
                
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href === '/assignments' ? '/' : item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-text-muted hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
