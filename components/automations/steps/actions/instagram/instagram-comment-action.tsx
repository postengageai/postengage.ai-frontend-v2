import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          {payload.use_ai_reply ? 'Fallback Message' : 'Message Content'}
        </Label>
        <div className='flex items-center space-x-2'>
          <Label
            htmlFor='comment-ai-reply'
            className='cursor-pointer text-xs text-muted-foreground'
          >
            Auto-generate with AI
          </Label>
          <Switch
            id='comment-ai-reply'
            checked={payload.use_ai_reply || false}
            onCheckedChange={checked =>
              onUpdate({
                ...payload,
                use_ai_reply: checked,
              })
            }
          />
        </div>
      </div>

      {payload.use_ai_reply && (
        <div className='relative mb-4 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
              <Sparkles className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                AI Reply Active
              </h3>
              <p className='text-xs text-muted-foreground'>
                AI will generate the response.
              </p>
            </div>
          </div>
        </div>
      )}

      <Textarea
        placeholder={
          payload.use_ai_reply
            ? 'Enter a fallback message in case AI fails...'
            : `Enter ${actionType === AutomationActionType.REPLY_COMMENT ? 'reply' : 'DM'} message...`
        }
        value={payload.text || ''}
        onChange={e =>
          onUpdate({
            ...payload,
            text: e.target.value,
          })
        }
        rows={5}
        className='resize-none'
      />
      {payload.use_ai_reply && (
        <p className='text-xs text-muted-foreground'>
          This message will be sent if the AI cannot generate a response.
        </p>
      )}
    </div>
  );
}
