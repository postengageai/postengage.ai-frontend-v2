'use client';

import { useRouter, useParams } from 'next/navigation';
import { AutomationEditWizard } from '@/components/automations/automation-edit-wizard';

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const automationId = params.id as string;

  const handleComplete = (automation: any) => {
    console.log('Updated automation:', automation);
    // In production, call API to update
    router.push(`/dashboard/automations/${automationId}`);
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
