import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AutomationActionType,
  AutomationActionTypeType,
} from '@/lib/constants/automations';
import {
  ReplyCommentPayload,
  PrivateReplyPayload,
} from '@/lib/api/automations';

interface InstagramCommentActionProps {
  actionType: AutomationActionTypeType;
  payload: ReplyCommentPayload | PrivateReplyPayload;
  onUpdate: (
    updates: Partial<ReplyCommentPayload | PrivateReplyPayload>
  ) => void;
}

export function InstagramCommentAction({
  actionType,
  payload,
  onUpdate,
}: InstagramCommentActionProps) {
  return (
    <div>
      <Label className='mb-2 block text-sm font-medium'>Message</Label>
      <Textarea
        placeholder={`Enter ${actionType === AutomationActionType.REPLY_COMMENT ? 'reply' : 'DM'} message...`}
        value={payload.text || ''}
        onChange={e =>
          onUpdate({
            ...payload,
            text: e.target.value,
          })
        }
        rows={3}
      />
    </div>
  );
}
