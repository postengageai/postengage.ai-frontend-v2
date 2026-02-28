'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  Pencil,
  AlertTriangle,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { FlaggedReply } from '@/lib/types/quality';
import type { PaginationMeta } from '@/lib/http/client';
import { useToast } from '@/hooks/use-toast';

interface FlaggedReviewQueueProps {
  botId: string;
}

export function FlaggedReviewQueue({ botId }: FlaggedReviewQueueProps) {
  const [replies, setReplies] = useState<FlaggedReply[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showReviewed, setShowReviewed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await IntelligenceApi.getFlaggedReplies(botId, {
        page,
        limit: 20,
        reviewed: showReviewed ? undefined : false,
      });
      if (response?.data) {
        setReplies(response.data);
        setPagination(response.pagination);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load flagged replies',
      });
    } finally {
      setIsLoading(false);
    }
  }, [botId, page, showReviewed, toast]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  const handleApprove = async (replyId: string) => {
    setActionLoading(replyId);
    try {
      await IntelligenceApi.approveReply(replyId);
      setReplies(prev => prev.filter(r => r._id !== replyId));
      toast({ title: 'Reply approved and sent' });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve reply',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (replyId: string) => {
    setActionLoading(replyId);
    try {
      await IntelligenceApi.rejectReply(replyId);
      setReplies(prev => prev.filter(r => r._id !== replyId));
      setRejectDialogId(null);
      toast({ title: 'Reply rejected' });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject reply',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditApprove = async (replyId: string) => {
    if (!editText.trim()) return;
    setActionLoading(replyId);
    try {
      await IntelligenceApi.editAndApproveReply(replyId, editText);
      setReplies(prev => prev.filter(r => r._id !== replyId));
      setEditingId(null);
      setEditText('');
      toast({ title: 'Edited reply approved and sent' });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to edit and approve reply',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (reply: FlaggedReply) => {
    setEditingId(reply._id);
    setEditText(reply.generated_reply);
  };

  const totalPages = pagination?.total_pages || 1;

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    if (score >= 0.3) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className='h-40 w-full rounded-lg' />
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filter toggle */}
      <div className='flex items-center gap-2'>
        <Button
          variant={!showReviewed ? 'default' : 'outline'}
          size='sm'
          onClick={() => {
            setShowReviewed(false);
            setPage(1);
          }}
        >
          Pending
        </Button>
        <Button
          variant={showReviewed ? 'default' : 'outline'}
          size='sm'
          onClick={() => {
            setShowReviewed(true);
            setPage(1);
          }}
        >
          All
        </Button>
        {pagination?.total !== undefined && (
          <span className='text-xs text-muted-foreground ml-auto'>
            {pagination.total} replies
          </span>
        )}
      </div>

      {/* Empty state */}
      {replies.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10'>
          <Shield className='h-10 w-10 text-green-500 mb-3' />
          <h3 className='text-lg font-medium mb-1'>No Flagged Replies</h3>
          <p className='text-sm text-muted-foreground max-w-sm'>
            {showReviewed
              ? 'No flagged replies found.'
              : 'Your bot is doing great! No replies need your review right now.'}
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {replies.map(reply => (
            <div
              key={reply._id}
              className='rounded-lg border bg-card p-4 space-y-3'
            >
              {/* Header */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={
                      reply.action_taken === 'held_for_approval'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                        : 'bg-blue-50 text-blue-700 border-blue-300'
                    }
                  >
                    {reply.action_taken === 'held_for_approval'
                      ? 'Held'
                      : 'Safe Template'}
                  </Badge>
                  <Badge variant='outline' className='text-[10px]'>
                    <AlertTriangle className='h-3 w-3 mr-1' />
                    {reply.flag_reason}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`text-xs font-medium ${getConfidenceColor(reply.confidence_score)}`}
                  >
                    {(reply.confidence_score * 100).toFixed(0)}%
                  </span>
                  <span className='text-[10px] text-muted-foreground'>
                    {new Date(reply.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Original message */}
              <div className='rounded-md bg-muted/50 p-3'>
                <p className='text-[10px] text-muted-foreground mb-1 flex items-center gap-1'>
                  <MessageSquare className='h-3 w-3' /> User message
                </p>
                <p className='text-sm'>{reply.original_message}</p>
              </div>

              {/* Generated reply / Edit mode */}
              {editingId === reply._id ? (
                <div className='space-y-2'>
                  <p className='text-[10px] text-muted-foreground'>
                    Edit reply before approving:
                  </p>
                  <Textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={3}
                    className='text-sm'
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={() => handleEditApprove(reply._id)}
                      disabled={actionLoading === reply._id || !editText.trim()}
                    >
                      <Check className='h-3.5 w-3.5 mr-1' />
                      Confirm & Send
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='rounded-md border p-3'>
                  <p className='text-[10px] text-muted-foreground mb-1'>
                    Bot reply
                  </p>
                  <p className='text-sm'>{reply.generated_reply}</p>
                </div>
              )}

              {/* Action buttons */}
              {!reply.reviewed && editingId !== reply._id && (
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    className='bg-green-600 hover:bg-green-700'
                    onClick={() => handleApprove(reply._id)}
                    disabled={actionLoading === reply._id}
                  >
                    <Check className='h-3.5 w-3.5 mr-1' />
                    Approve
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => startEdit(reply)}
                    disabled={actionLoading === reply._id}
                  >
                    <Pencil className='h-3.5 w-3.5 mr-1' />
                    Edit & Approve
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => setRejectDialogId(reply._id)}
                    disabled={actionLoading === reply._id}
                  >
                    <X className='h-3.5 w-3.5 mr-1' />
                    Reject
                  </Button>
                </div>
              )}

              {reply.reviewed && (
                <Badge variant='secondary' className='text-xs'>
                  Reviewed
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-2'>
          <p className='text-xs text-muted-foreground'>
            Page {page} of {totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Reject confirmation dialog */}
      <AlertDialog
        open={!!rejectDialogId}
        onOpenChange={() => setRejectDialogId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This reply will not be sent. The bot will learn from this feedback
              to improve future responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => rejectDialogId && handleReject(rejectDialogId)}
            >
              Reject Reply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
