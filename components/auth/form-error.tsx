import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  title?: string;
  message: string;
}

export function FormError({ title, message }: FormErrorProps) {
  return (
    <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4'>
      <div className='flex gap-3'>
        <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
        <div>
          {title && (
            <p className='font-medium text-destructive text-sm'>{title}</p>
          )}
          <p className='text-sm text-destructive/90'>{message}</p>
        </div>
      </div>
    </div>
  );
}
