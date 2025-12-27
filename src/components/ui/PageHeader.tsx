export default function PageHeader({
  title,
  subtitle,
  action,
  align = 'center',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`${align === 'center' ? 'text-center' : ''} mb-6`}>
      <div className={`flex items-center ${align === 'center' ? 'justify-center' : 'justify-between'} gap-3`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
