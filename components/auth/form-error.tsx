import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  title?: string;
  message: string;
}

export function FormError({ title, message }: FormErrorProps) {
  return (
    <div className='rounded-xl border border-error/20 bg-error/8 p-4'>
      <div className='flex gap-3'>
        <AlertCircle className='h-5 w-5 text-error shrink-0 mt-0.5' />
        <div>
          {title && <p className='font-medium text-error text-sm'>{title}</p>}
          <p className='text-sm text-error/80'>{message}</p>
        </div>
      </div>
    </div>
  );
}
