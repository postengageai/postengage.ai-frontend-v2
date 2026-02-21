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
        <Label className='text-sm font-medium'>Message Content</Label>
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

      {payload.use_ai_reply ? (
        <div className='relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-6'>
          <div className='absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl' />
          <div className='relative z-10 flex flex-col items-center text-center'>
            <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5'>
              <Sparkles className='h-6 w-6 text-primary' />
            </div>
            <h3 className='mb-1 font-semibold text-foreground'>
              AI Reply Active
            </h3>
            <p className='max-w-xs text-sm text-muted-foreground'>
              The AI will automatically generate a relevant reply based on the
              user&apos;s comment and your brand voice.
            </p>
          </div>
        </div>
      ) : (
        <Textarea
          placeholder={`Enter ${actionType === AutomationActionType.REPLY_COMMENT ? 'reply' : 'DM'} message...`}
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
      )}
    </div>
  );
}
