'use client';

import Link from 'next/link';
import { IconClipboardList, IconUserShield, IconDatabase, IconGauge, IconShieldCheck, IconCloudDownload, IconDeviceMobileCheck, IconSparkles, IconPointerExclamation, IconPointerCheck, IconPointerPause, IconPointerUp, IconPointer, IconDashboard, IconCross, IconCrossOff, IconCrosshair, IconX, IconXd } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
		<Card className="text-center card-shadow hover:-translate-y-0.5 transition-transform h-full">
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
		</Card>
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
		<div className="space-y-10">
			{/* Hero */}
			<section className="relative overflow-hidden rounded-3xl md:px-6 py-10">
				<div className="absolute inset-0 pointer-events-none" 
        // style={{ background: 'radial-gradient(circle at 10% 20%, rgba(99,102,241,0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.08), transparent 22%)' }} 
        />
				<div className="relative max-w-4xl mx-auto md:text-center space-y-8 py-8">
					<div className="mx-auto w-fit rounded-full bg-indigo-600/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-indigo-700 font-mono">
						Zero spreadsheets. Zero chats. Just audits.
					</div>
					<h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            <span className=''>
						Real Estate Audits? <br/>
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
					<div className="flex flex-wrap md:justify-center gap-3 mt-2">
						<Link href="/auditor" className="">
							<Button className=" justify-center px-5 py-3 text-emerald-50 p-2 bg-emerald-700 hover:bg-emerald-800"><IconPointer/>Start auditing now</Button>
						</Link>
						<Link href="/builder" className="">
							<Button variant="outline" className=" justify-center px-5 py-3"><IconDashboard/>See builder console</Button>
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
			{process.env.NODE_ENV !== 'production' && (
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
			)}

			{/* Value props */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-start gap-3">
					<div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
						<IconGauge size={20} />
					</div>
					<div>
						<p className="font-semibold text-sm text-gray-900">Risk-first dashboards</p>
						<p className="text-sm text-gray-600">Auto-prioritize hot spots by severity, repeat defects, and fix lead time.</p>
					</div>
				</div>
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-start gap-3">
					<div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
						<IconShieldCheck size={20} />
					</div>
					<div>
						<p className="font-semibold text-sm text-gray-900">Evidence that sticks</p>
						<p className="text-sm text-gray-600">Geo/time-stamped photos, checklist sign-offs, and audit trails built-in.</p>
					</div>
				</div>
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-start gap-3">
					<div className="rounded-lg bg-sky-50 p-2 text-sky-700">
						<IconDeviceMobileCheck size={20} />
					</div>
					<div>
						<p className="font-semibold text-sm text-gray-900">Field-proof workflow</p>
						<p className="text-sm text-gray-600">Offline-first audits, fast capture, and one-tap tasking to trades.</p>
					</div>
				</div>
				<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-start gap-3">
					<div className="rounded-lg bg-amber-50 p-2 text-amber-700">
						<IconCloudDownload size={20} />
					</div>
					<div>
						<p className="font-semibold text-sm text-gray-900">Plug into your stack</p>
						<p className="text-sm text-gray-600">APIs and webhooks to push findings into PM, chat, or BI tools.</p>
					</div>
				</div>
			</div>

			{/* Highlights */}
			<div className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
				<div className="flex items-center gap-2 mb-4">
					<div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
						<IconSparkles size={20} />
					</div>
					<h3 className="text-lg font-semibold text-gray-900">Built for modern construction teams</h3>
				</div>
				<div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
					<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
						<p className="font-semibold text-gray-900 mb-1">Speed to insight</p>
						<p>Inline audits, no tab-hopping, and instant pass/fail with evidence—zero manual collation.</p>
					</div>
					<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
						<p className="font-semibold text-gray-900 mb-1">Quality confidence</p>
						<p>Templates with must-pass gates, auto-escalations, and readiness reports.</p>
					</div>
					<div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
						<p className="font-semibold text-gray-900 mb-1">Team alignment</p>
						<p>Homeowners, builders, and auditors see the same live state—no spreadsheets, no email chases.</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full mt-8">
				<HomeCard
					href="/auditor"
					icon={<IconClipboardList size={36} />}
					title="Auditor"
					description="Perform checks, collect defects, and add evidence"
					buttonLabel="Start Auditing"
				/>
				<HomeCard
					href="/builder"
					icon={<IconUserShield size={36} />}
					title="Builder"
					description="View dashboards, track quality, analyze trends"
					buttonLabel="View Dashboard"
					buttonVariant="outline"
				/>
			</div>

		</div>
	);
}
