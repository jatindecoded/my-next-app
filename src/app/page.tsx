'use client';

import Link from 'next/link';
import { IconClipboardList, IconUserShield, IconGauge, IconShieldCheck, IconCloudDownload, IconPointerCheck, IconPointerUp, IconPointer, IconDashboard, IconBuildingSkyscraper, IconAlertTriangle } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card as UICard, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/cards/Card';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface HomeCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: 'default' | 'outline';
}

function HomeCard({ href, icon, title, description, buttonLabel, buttonVariant = 'default' }: HomeCardProps) {
  return (
    <UICard className="text-center card-shadow hover:-translate-y-0.5 transition-transform h-full">
      <Link href={href} className="h-full">
        <CardContent className="space-y-4 my-8 flex flex-col justify-center">
          <div className='flex items-center justify-center'>
            {icon}
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <span>{title}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
        <CardFooter>
          <Button variant={buttonVariant} className="w-full justify-center">
            {buttonLabel}
          </Button>
        </CardFooter>
      </Link>
    </UICard>
  );
}

export default function Home() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);

    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json() as { success?: boolean; message?: string; error?: string };

      if (response.ok) {
        setSeedResult({ success: true, message: data.message || 'Seeded successfully' });
        // Refresh the page after 2 seconds to show new data
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setSeedResult({ success: false, error: data.error || data.message || 'Failed to seed' });
      }
    } catch {
      setSeedResult({ success: false, error: 'Failed to seed database' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-12 px-2 md:px-6 max-w-6xl mx-auto]">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl md:px-6 py-10">
        <div className="absolute inset-0 pointer-events-none"
        // style={{ background: 'radial-gradient(circle at 10% 20%, rgba(99,102,241,0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.08), transparent 22%)' }} 
        />
        <div className="relative max-w-4xl mx-auto text-center space-y-8 pb-24 pt-12">
          <div className="mx-auto w-fit rounded-full bg-emerald-600/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-emerald-700 font-mono">
            Zero spreadsheets. Zero chats. Just audits.
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tighter leading-[1em]">
            <span className=''>
              Real Estate Audits? <br />
            </span>
            <span className=''>
              Say goodbye to pen-paper notes, Google Sheets, Excel, and WhatsApp.
            </span>
          </h1>
          {/* <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto font-semibold">
						Run every checklist, photo, punch list, and handover in one fast workflow. Evidence auto-packaged, teams aligned, no manual retyping.
					</p> */}
          {/* <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto tracking-tight font-semibold">
						No more exporting to Excel, printing audit pages, chasing WhatsApp approvals, or copying notes from paper to sheets.
					</p> */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/auditor" className="">
              <Button size={'lg'} className=" justify-center px-5 py-3 text-emerald-50 p-2 bg-emerald-700 hover:bg-emerald-800"><IconPointer />Start auditing now</Button>
            </Link>
            <Link href="/builder" className="">
              <Button size={'lg'} variant="outline" className=" justify-center px-5 py-3"><IconDashboard />See builder console</Button>
            </Link>
          </div>
          {/* <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold text-gray-800 mt-4">
						<div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex gap-2 items-center min-w-[250px] justify-center"><IconX size={12}/>No clipboards, no retyping</div>
						<div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 flex gap-2 items-center min-w-[250px] justify-center"><IconX size={12}/>Goodbye Google Sheets & Excel</div>
						<div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-100 flex gap-2 items-center min-w-[250px] justify-center"><IconX size={12}/>No more WhatsApp/email chases</div>
					</div> */}
        </div>
      </section>

      {/* Development seed button */}
      {/* {process.env.NODE_ENV !== 'production' && (
				<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<IconDatabase size={20} className="text-yellow-600" />
							<span className="text-sm font-medium text-yellow-900">Development Mode</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleSeed}
							disabled={seeding}
							className="border-yellow-300 hover:bg-yellow-100"
						>
							{seeding ? 'Seeding...' : 'Seed Database'}
						</Button>
					</div>
					{seedResult && (
						<p className={`mt-2 text-xs ${seedResult.success ? 'text-green-700' : 'text-red-700'}`}>
							{seedResult.success ? `✓ ${seedResult.message}` : `✗ ${seedResult.error}`}
						</p>
					)}
				</div>
			)} */}

      {/* Demo Links Section */}
      <div className="mt-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="flex flex-col gap-1 mb-6">
          {/* <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">Try live</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">Explore the console.</h2> */}

          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 ">Try live</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1em] tracking-tight">Try our Building Audit System.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Card
              variant="demo"
              icon={<IconUserShield size={20} className="text-gray-700" />}
              heading="Builder Console"
            >
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/builder"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">All Projects Dashboard</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/builder?view=defects"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">All Failures Across Projects</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/builder/projects/e738fc4c-c4ea-47c1-a586-b9842cd901d7"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Project Defects Details</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
              </ul>
            </Card>

            <Card
              variant="demo"
              icon={<IconClipboardList size={20} className="text-gray-700" />}
              heading="Auditor Console"
            >
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/auditor"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Auditor Dashboard</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auditor/projects/e738fc4c-c4ea-47c1-a586-b9842cd901d7"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Project Structure Navigator</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auditor/structure/e738fc4c-c4ea-47c1-a586-b9842cd901d7/bf367a46-f405-4456-b000-cae497f2414e/"
                    className="flex items-center justify-between group hover:bg-gray-100 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Audit History & Details</span>
                    <span className="text-gray-700 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 text-center text-xs text-gray-600">
            <p><span className="font-semibold text-gray-800">Demo data:</span> 3 towers × 10 floors × 4 units × 7 rooms = 841 checkpoints</p>
          </div>
        </div>


        {/* Impact stats */}
        <div className="mt-12">
          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Impact</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">Builders ship faster.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              variant="stat"
              pill="Handover speed"
              stat="-30%"
              description="Time to close"
            />
            <Card
              variant="stat"
              pill="Rework avoided"
              stat="-42%"
              description="Repeat defects"
            />
            <Card
              variant="stat"
              pill="Source of truth"
              stat="1"
              description="Live proof dashboard"
            />
          </div>
        </div>

        {/* Why builders switch */}
        <div className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-8 shadow-lg grid gap-8 w-full">
          <div className="space-y-4">
            {/* <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">
              <IconPointerCheck size={14} /> Built for builders
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">Accelerate every handover.</h2> */}

          <div className="mb-6 flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Built for Builders</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">Accelerate every handover.</h2>
          </div>
            <ul className="space-y-2.5 text-sm font-medium text-gray-700">
              <li className="flex gap-3 items-start">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>One queue by severity—no side chats</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Proof on every item. Proof, not chasing.</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Live reports. Clients see progress.</span>
              </li>
            </ul>
            <div className="flex gap-3 pt-2">
              <Link href="/builder" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-emerald-800 transition-colors">
                <IconDashboard size={16} /> Builder console
              </Link>
              <Link href="/auditor" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors">
                <IconClipboardList size={16} /> Auditor flow
              </Link>
            </div>
          </div>
          {/* <div className="grid gap-4">
            <Card
              variant="feature"
              icon={<IconGauge size={16} className="text-emerald-600" />}
              heading="Severity board"
              description="Sort by urgency"
            />
            <Card
              variant="feature"
              icon={<IconShieldCheck size={16} className="text-emerald-600" />}
              heading="Photo proof"
              description="Evidence required"
            />
            <Card
              variant="feature"
              icon={<IconCloudDownload size={16} className="text-emerald-600" />}
              heading="Live reports"
              description="Share with clients"
            />
          </div> */}
        </div>

        {/* Product tour */}
        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 rounded-3xl border border-gray-200 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-10 p-6 shadow-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-3">Tour</div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-2">See it in action.</h3>
            <p className="text-sm font-medium text-gray-700">Four steps. One workflow.</p>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
            <Card
              variant="step"
              href="/auditor"
              icon={<IconClipboardList size={18} className="text-emerald-600" />}
              heading="Capture"
              description="Checklist + photos"
              linkText="Start audit"
            />
            <Card
              variant="step"
              href="/builder?view=defects"
              icon={<IconAlertTriangle size={18} className="text-emerald-600" />}
              heading="Prioritize"
              description="Sort by urgency"
              linkText="View failures"
            />
            <Card
              variant="step"
              href="/builder/projects/e738fc4c-c4ea-47c1-a586-b9842cd901d7"
              icon={<IconBuildingSkyscraper size={18} className="text-emerald-600" />}
              heading="Drill in"
              description="Spot repeats fast"
              linkText="See project"
            />
            <Card
              variant="step"
              href="/auditor/structure/e738fc4c-c4ea-47c1-a586-b9842cd901d7/bf367a46-f405-4456-b000-cae497f2414e/"
              icon={<IconPointerUp size={18} className="text-emerald-600" />}
              heading="Review"
              description="Evidence trail"
              linkText="See history"
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-50">Ready?</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-[1.15] tracking-tight">Start auditing now.</h3>
            <p className="text-sm font-medium text-emerald-50">No spreadsheets. No spreadsheets. Just proof.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/auditor" className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-700 px-5 py-3 font-bold shadow-sm hover:bg-emerald-50 transition-colors">
              <IconPointer size={18} /> Start audit
            </Link>
            <Link href="/builder?view=defects" className="inline-flex items-center gap-2 rounded-full border border-white px-5 py-3 font-bold text-white hover:bg-white/10 transition-colors">
              <IconAlertTriangle size={18} /> View fails
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}