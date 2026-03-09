import { CheckCircle2 } from 'lucide-react';

interface FormSuccessProps {
  title?: string;
  message: string;
}

export function FormSuccess({ title, message }: FormSuccessProps) {
  return (
    <div className='rounded-xl border border-success/20 bg-success/8 p-4'>
      <div className='flex gap-3'>
        <CheckCircle2 className='h-5 w-5 text-success shrink-0 mt-0.5' />
        <div>
          {title && <p className='font-medium text-success text-sm'>{title}</p>}
          <p className='text-sm text-success/80'>{message}</p>
        </div>
      </div>
    </div>
  );
}
