'use client';

import { useRouter } from 'next/navigation';
import { AutomationFormPage } from '@/components/automations/automation-form-page';
import {
  AutomationsApi,
  type CreateAutomationRequest,
} from '@/lib/api/automations';
import { toast } from 'sonner';

export default function NewAutomationPage() {
  const router = useRouter();

  const handleComplete = async (request: CreateAutomationRequest) => {
    await AutomationsApi.create(request);
    toast.success('Automation created successfully');
    router.push('/dashboard/automations');
  };

  const handleCancel = () => {
    router.push('/dashboard/automations');
  };

  return (
    <AutomationFormPage onComplete={handleComplete} onCancel={handleCancel} />
  );
}
