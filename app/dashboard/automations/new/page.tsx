'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { AutomationWizard } from '@/components/automations/automation-wizard';
import {
  AutomationsApi,
  type CreateAutomationRequest,
} from '@/lib/api/automations';

export default function NewAutomationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleComplete = async (request: CreateAutomationRequest) => {
    try {
      await AutomationsApi.create(request);

      toast({
        title: 'Success',
        description: 'Automation created successfully',
      });

      router.push('/dashboard/automations');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create automation',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/automations');
  };

  return (
    <AutomationWizard onComplete={handleComplete} onCancel={handleCancel} />
  );
}
