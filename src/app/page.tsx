import Link from 'next/link';
import { IconClipboardList, IconUserShield } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Construction Audit Platform"
        subtitle="Standardized checks, clean data, better building quality."
        align="center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/auditor"
          className="p-6 border border-gray-200 rounded-xl bg-white card-shadow hover:border-indigo-400 hover:shadow-lg transition-all text-center"
        >
          <div className="flex items-center justify-center gap-2 text-indigo-700 mb-2">
            <IconClipboardList size={18} />
            <span className="font-semibold">Auditor</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Perform checks, collect defects, and add evidence
          </p>
          <span className="btn btn-primary inline-block">Start Auditing</span>
        </Link>

        <Link
          href="/builder"
          className="p-6 border border-gray-200 rounded-xl bg-white card-shadow hover:border-indigo-400 hover:shadow-lg transition-all text-center"
        >
          <div className="flex items-center justify-center gap-2 text-indigo-700 mb-2">
            <IconUserShield size={18} />
            <span className="font-semibold">Builder</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            View dashboards, track quality, analyze trends
          </p>
          <span className="btn btn-outline inline-block">View Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
