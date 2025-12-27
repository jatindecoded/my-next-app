import Link from 'next/link';
import { IconClipboardList, IconUserShield } from '@tabler/icons-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

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
	return (
		<div>
			<PageHeader
				title="Construction Audit Platform"
				subtitle="Standardized checks, clean data, better building quality."
				align="center"
			/>

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
