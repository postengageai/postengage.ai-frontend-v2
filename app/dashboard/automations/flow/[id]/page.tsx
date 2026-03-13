import { AutomationBuilderV2 } from '@/components/automation-builder-v2';

// In a real app you'd fetch the saved flow by `params.id` and pass it as initialState.
// For now we render the builder in edit mode with an empty state so routing works.
export default function EditFlowPage({ params }: { params: { id: string } }) {
  return (
    <AutomationBuilderV2
      initialState={{
        id: params.id,
        name: 'Loading…',
        status: 'draft',
        nodes: [],
      }}
    />
  );
}
