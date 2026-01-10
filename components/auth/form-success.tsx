import { CheckCircle2 } from 'lucide-react';

interface FormSuccessProps {
  title?: string;
  message: string;
}

export function FormSuccess({ title, message }: FormSuccessProps) {
  return (
    <div className='rounded-lg border border-green-500/20 bg-green-500/5 p-4'>
      <div className='flex gap-3'>
        <CheckCircle2 className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
        <div>
          {title && (
            <p className='font-medium text-green-500 text-sm'>{title}</p>
          )}
          <p className='text-sm text-green-500/90'>{message}</p>
        </div>
      </div>
    </div>
  );
}
