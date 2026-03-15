import Link from 'next/link';

/**
 * PostEngage.ai logo — used at the top of auth pages.
 * size="sm" for centered cards, size="md" for split layout panels.
 */
export function AuthLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <Link href='/' className='flex items-center gap-2.5 w-fit'>
      <div
        className={`${iconSize} rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0`}
      >
        {/* Lightning bolt icon */}
        <svg viewBox='0 0 16 16' fill='none' className='h-4 w-4 text-white'>
          <path
            d='M9 1L3 9h5.5L7 15l7-9H8.5L9 1z'
            fill='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      <span className={`${textSize} font-semibold text-foreground`}>
        PostEngage<span className='text-primary'>.ai</span>
      </span>
    </Link>
  );
}
