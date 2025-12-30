import { IconHandClick, IconLink, IconPointer } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface CardProps {
	variant?: 'stat' | 'feature' | 'demo' | 'step' | 'default';
	pill?: string;
	icon?: ReactNode;
	heading?: string;
	stat?: string;
	description?: string;
	children?: ReactNode;
	href?: string;
	linkText?: string;
}

export function Card({
	variant = 'default',
	pill,
	icon,
	heading,
	stat,
	description,
	children,
	href,
	linkText,
}: CardProps) {
	// Consistent wrapper for all variants
	const containerClasses = 'rounded-2xl border border-gray-200 p-5 shadow-sm';
	const hoverClasses = variant === 'step' ? 'hover:-translate-y-0.5 transition-transform' : '';
	const bgClasses = variant === 'stat' 
		? 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200'
		: variant === 'feature'
		? 'bg-gradient-to-br from-slate-50 to-slate-100'
		: 'bg-white';

	const wrapper = variant === 'step' && href
		? (content: ReactNode) => (
			<a href={href} className={`group ${containerClasses} ${bgClasses} ${hoverClasses} block`}>{content}</a>
		)
		: (content: ReactNode) => (
			<div className={`group ${containerClasses} ${bgClasses} ${hoverClasses}`}>{content}</div>
		);

	return wrapper(
		variant === 'stat' ? (
			<>
				{pill && <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">{pill}</p>}
				{stat && <p className="text-3xl font-black text-gray-900 mb-2">{stat}</p>}
				{description && <p className="text-sm text-gray-700 italic">{description}</p>}
			</>
		) : variant === 'feature' ? (
			<>
				<div className="flex items-center gap-4 ">
					{icon}
					<div>
						{/* {pill && (
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-700 block mb-1">{pill}</p>
						)} */}
						{heading && <p className="text-lg font-extrabold">{heading}</p>}
					</div>
				</div>
				{/* {(description || children) && <p className="text-sm text-gray-700">{description || children}</p>} */}
			</>
		) : variant === 'demo' ? (
			<>
				<div className="flex items-center gap-2 mb-3 border-b pb-4">
					{icon}
					{heading && <p className="text-md font-bold">{heading}</p>}
				</div>
				{children}
			</>
		) : variant === 'step' ? (
			<>
				<div className="flex items-center gap-2 mb-2">
					{icon}
					<p className="text-sm font-bold text-gray-900">{heading}</p>
				</div>
				{description && <p className="text-sm text-gray-700 mb-2">{description}</p>}
				{linkText && <p className="text-xs font-semibold group-hover:underline text-emerald-700 flex gap-1 items-center">{linkText}<IconHandClick size={12}/></p>}
			</>
		) : (
			<>
				{pill && <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-2">{pill}</p>}
				{heading && <p className="text-sm font-semibold text-gray-900 mb-3">{heading}</p>}
				{children}
			</>
		)
	);
}
