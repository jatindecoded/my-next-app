'use client';

import { usePathname } from 'next/navigation';
import { IconBuildingSkyscraper, IconClipboardList, IconUserShield, IconChevronLeft, IconMenu2, IconX, IconHome } from '@tabler/icons-react';
import ProjectTreeNav from '@/components/ui/ProjectTreeNav';
import { ReactNode, useState } from 'react';

export default function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Determine if we're on a project page and extract project ID
  const projectMatch = pathname.match(/\/(auditor|builder)\/(?:projects|structure|audit)\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[2] : null;
  const role = projectMatch ? projectMatch[1] as 'auditor' | 'builder' : null;

  return (
    <>
      {/* Mobile top nav */}
      <nav className="border-b border-gray-200 bg-white/90 backdrop-blur md:hidden sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-900 font-semibold">
            <IconBuildingSkyscraper size={20} />
            <span>Quality Audit</span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden overflow-y-auto pt-[57px]">
          <nav className="p-4 space-y-2">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 text-gray-800"
            >
              <IconHome size={20} />
              <span className="font-medium">Home</span>
            </a>
            <a
              href="/auditor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 text-gray-800"
            >
              <IconClipboardList size={20} />
              <span className="font-medium">Auditor</span>
            </a>
            <a
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 text-gray-800"
            >
              <IconUserShield size={20} />
              <span className="font-medium">Builder</span>
            </a>

            {/* Project tree in mobile menu */}
            {projectId && role && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <a
                  href={`/${role}/projects/${projectId}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 px-4 py-2 font-medium"
                >
                  <IconChevronLeft size={14} />
                  Back to Project
                </a>
                <div className="px-2">
                  <ProjectTreeNav projectId={projectId} role={role} />
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      <div className="min-h-screen md:flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-hidden">
          {/* Header */}
          <a
            href="/"
            className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 text-gray-900 font-semibold flex-shrink-0 hover:bg-gray-50 transition-colors"
          >
            <IconBuildingSkyscraper size={20} />
            <span>Quality Audit</span>
          </a>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Main navigation */}
            <nav className="p-3 space-y-1 border-b border-gray-200">
              <a
                href="/"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-800"
              >
                <IconHome size={18} />
                <span className="font-medium">Home</span>
              </a>
              <a
                href="/auditor"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-800"
              >
                <IconClipboardList size={18} />
                <span className="font-medium">Auditor</span>
              </a>
              <a
                href="/builder"
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-50 text-gray-800"
              >
                <IconUserShield size={18} />
                <span className="font-medium">Builder</span>
              </a>
            </nav>

            {/* Project tree navigation - only show when on a project page */}
            {projectId && role && (
              <div className="p-3">
                <a
                  href={`/${role}/projects/${projectId}`}
                  className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 mb-3 font-medium"
                >
                  <IconChevronLeft size={14} />
                  Back to Project
                </a>
                <ProjectTreeNav projectId={projectId} role={role} />
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64">
          <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </>
  );
}
