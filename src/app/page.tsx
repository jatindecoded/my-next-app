'use client';

import Link from 'next/link';
import { IconClipboardList, IconUserShield, IconDatabase } from '@tabler/icons-react';
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
				<CardContent className="space-y-4 md:min-h-[30vh] my-8 flex flex-col justify-center">
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
		<div>
			<PageHeader
				title="Construction Audit Platform"
				subtitle="Standardized checks, clean data, better building quality."
				align="center"
			/>

			{/* Development seed button */}
			{process.env.NODE_ENV !== 'prod' && (
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
