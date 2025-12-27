import Link from 'next/link';

export type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
  size = 'sm',
  className = '',
}: {
  items: Crumb[];
  size?: 'xs' | 'sm';
  className?: string;
}) {
  if (!items || items.length === 0) return null;
  const sizeClass = size === 'xs' ? 'text-xs' : 'text-sm';
  return (
    <nav aria-label="Breadcrumb" className={`${sizeClass} text-gray-600 ${className}`}>
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((c, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-gray-300">/</span>}
            {c.href ? (
              <Link href={c.href} className="text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
                {c.label}
              </Link>
            ) : (
              <span className="text-gray-700 whitespace-nowrap">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
