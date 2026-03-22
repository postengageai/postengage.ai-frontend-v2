'use client';

import { useRouter } from 'next/navigation';
import { AutomationFormPage } from '@/components/automations/automation-form-page';
import {
  AutomationsApi,
  type CreateAutomationRequest,
} from '@/lib/api/automations';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/http/errors';

export default function NewAutomationPage() {
  const router = useRouter();

  const handleComplete = async (request: CreateAutomationRequest) => {
    try {
      await AutomationsApi.create(request);
      toast.success('Automation created successfully');
      router.push('/dashboard/automations');
    } catch (err) {
      const e = parseApiError(err);
      toast.error(e.title, { description: e.message });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/automations');
  };

  return (
    <AutomationFormPage onComplete={handleComplete} onCancel={handleCancel} />
  );
}
