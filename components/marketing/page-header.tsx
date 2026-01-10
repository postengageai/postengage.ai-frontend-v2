interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
}

export function PageHeader({ badge, title, description }: PageHeaderProps) {
  return (
    <div className='mx-auto max-w-3xl text-center'>
      {badge && (
        <div className='mb-4 inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground'>
          {badge}
        </div>
      )}
      <h1 className='text-4xl font-bold tracking-tight sm:text-5xl text-balance'>
        {title}
      </h1>
      <p className='mt-6 text-lg text-muted-foreground text-pretty'>
        {description}
      </p>
    </div>
  );
}
