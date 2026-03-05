'use client';

import { useState } from 'react';
import { Check, Pencil, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { useToast } from '@/hooks/use-toast';

interface FeedbackCollectorProps {
  voiceDnaId: string;
  botId: string;
  originalMessage: string;
  generatedReply: string;
  onFeedbackSubmitted?: () => void;
}

type FeedbackState = 'idle' | 'editing' | 'rejecting' | 'submitted';

export function FeedbackCollector({
  voiceDnaId,
  botId,
  originalMessage,
  generatedReply,
  onFeedbackSubmitted,
}: FeedbackCollectorProps) {
  const [state, setState] = useState<FeedbackState>('idle');
  const [editedReply, setEditedReply] = useState(generatedReply);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedType, setSubmittedType] = useState<string | null>(null);
  const { toast } = useToast();

  const submitFeedback = async (type: 'approve' | 'edit' | 'reject') => {
    setIsSubmitting(true);
    try {
      await VoiceDnaApi.submitVoiceFeedback({
        voice_dna_id: voiceDnaId,
        bot_id: botId,
        feedback_type: type,
        original_reply: generatedReply,
        edited_reply: type === 'edit' ? editedReply : undefined,
        context: originalMessage,
        reason: type === 'reject' ? rejectReason : undefined,
      });

      setSubmittedType(type);
      setState('submitted');
      toast({
        title:
          type === 'approve'
            ? 'Feedback: Approved'
            : type === 'edit'
              ? 'Feedback: Edited'
              : 'Feedback: Rejected',
        description: 'Thanks! Your feedback helps improve the bot.',
      });
      onFeedbackSubmitted?.();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit feedback',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === 'submitted') {
    return (
      <div className='flex items-center gap-2 py-2'>
        <Badge
          variant='outline'
          className={
            submittedType === 'approve'
              ? 'bg-green-50 text-green-700 border-green-300'
              : submittedType === 'edit'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                : 'bg-red-50 text-red-700 border-red-300'
          }
        >
          {submittedType === 'approve'
            ? 'Approved'
            : submittedType === 'edit'
              ? 'Edited'
              : 'Rejected'}
        </Badge>
        <span className='text-xs text-muted-foreground'>Feedback recorded</span>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* Message context */}
      <div className='rounded-md bg-muted/50 p-3'>
        <p className='text-[10px] text-muted-foreground mb-1'>User message</p>
        <p className='text-sm'>{originalMessage}</p>
      </div>

      {/* Reply / Edit mode */}
      {state === 'editing' ? (
        <div className='space-y-2'>
          <p className='text-[10px] text-muted-foreground'>
            Edit the reply to match your style:
          </p>
          <Textarea
            value={editedReply}
            onChange={e => setEditedReply(e.target.value)}
            rows={3}
            className='text-sm'
          />
          <div className='flex gap-2'>
            <Button
              size='sm'
              onClick={() => submitFeedback('edit')}
              disabled={isSubmitting || !editedReply.trim()}
            >
              {isSubmitting ? (
                <Loader2 className='h-3.5 w-3.5 mr-1 animate-spin' />
              ) : (
                <Check className='h-3.5 w-3.5 mr-1' />
              )}
              Save Edit
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => {
                setState('idle');
                setEditedReply(generatedReply);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : state === 'rejecting' ? (
        <div className='space-y-2'>
          <div className='rounded-md border p-3'>
            <p className='text-[10px] text-muted-foreground mb-1'>Bot reply</p>
            <p className='text-sm'>{generatedReply}</p>
          </div>
          <Textarea
            placeholder="Why doesn't this sound like you? (optional)"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={2}
            className='text-sm'
          />
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => submitFeedback('reject')}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='h-3.5 w-3.5 mr-1 animate-spin' />
              ) : (
                <X className='h-3.5 w-3.5 mr-1' />
              )}
              Confirm Reject
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => {
                setState('idle');
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className='rounded-md border p-3'>
            <p className='text-[10px] text-muted-foreground mb-1'>Bot reply</p>
            <p className='text-sm'>{generatedReply}</p>
          </div>

          {/* Action buttons */}
          <div className='flex gap-2'>
            <Button
              size='sm'
              className='bg-green-600 hover:bg-green-700'
              onClick={() => submitFeedback('approve')}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='h-3.5 w-3.5 mr-1 animate-spin' />
              ) : (
                <Check className='h-3.5 w-3.5 mr-1' />
              )}
              Sounds like me
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setState('editing')}
            >
              <Pencil className='h-3.5 w-3.5 mr-1' />
              Almost, fix it
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => setState('rejecting')}
            >
              <X className='h-3.5 w-3.5 mr-1' />
              Not my style
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
