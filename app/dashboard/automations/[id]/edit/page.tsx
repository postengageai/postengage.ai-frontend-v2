'use client';

import { useRouter, useParams } from 'next/navigation';
import { AutomationEditWizard } from '@/components/automations/automation-edit-wizard';
import { CreateAutomationRequest, AutomationsApi } from '@/lib/api/automations';
import { toast } from 'sonner';

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const automationId = params.id as string;

  const handleComplete = async (automation: CreateAutomationRequest) => {
    try {
      await AutomationsApi.update(automationId, automation);
      toast.success('Automation updated successfully');
      router.push(`/dashboard/automations/${automationId}`);
    } catch {
      toast.error('Failed to update automation');
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/automations/${automationId}`);
  };

  return (
    <AutomationEditWizard
      automationId={automationId}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
