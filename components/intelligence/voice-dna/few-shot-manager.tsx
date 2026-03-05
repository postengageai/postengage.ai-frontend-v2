'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { FewShotExample, AddFewShotDto } from '@/lib/types/voice-dna';

interface FewShotManagerProps {
  examples: FewShotExample[];
  onAdd: (dto: AddFewShotDto) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isLoading?: boolean;
}

const SOURCE_LABELS: Record<FewShotExample['source'], string> = {
  creator_manual: 'Manual',
  creator_edited: 'Edited',
  ai_approved: 'AI Approved',
  curated: 'Curated',
};

export function FewShotManager({
  examples,
  onAdd,
  onDelete,
  isLoading,
}: FewShotManagerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [newExample, setNewExample] = useState({
    context: '',
    reply: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newExample.context.trim() || !newExample.reply.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        context: newExample.context.trim(),
        reply: newExample.reply.trim(),
        tags: newExample.tags
          ? newExample.tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : undefined,
      });
      setNewExample({ context: '', reply: '', tags: '' });
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    await onDelete(index);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Few-Shot Examples</h3>
          <p className='text-xs text-muted-foreground mt-1'>
            {examples.length} example{examples.length !== 1 ? 's' : ''} — these
            teach your bot how to respond
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              Add Example
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>Add Few-Shot Example</DialogTitle>
              <DialogDescription>
                Provide a sample comment/question and your ideal response. This
                teaches your bot your style.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='context'>
                  Comment / Question (what someone says)
                </Label>
                <Textarea
                  id='context'
                  placeholder='e.g., "How much does this product cost?"'
                  value={newExample.context}
                  onChange={e =>
                    setNewExample(prev => ({
                      ...prev,
                      context: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='reply'>
                  Ideal Reply (how you want to respond)
                </Label>
                <Textarea
                  id='reply'
                  placeholder='e.g., "Hey! Great question — check the link in our bio for all pricing details. DM me if you need help choosing!"'
                  value={newExample.reply}
                  onChange={e =>
                    setNewExample(prev => ({ ...prev, reply: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='tags'>Tags (comma-separated, optional)</Label>
                <Input
                  id='tags'
                  placeholder='e.g., pricing, casual, hinglish'
                  value={newExample.tags}
                  onChange={e =>
                    setNewExample(prev => ({ ...prev, tags: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={
                  !newExample.context.trim() ||
                  !newExample.reply.trim() ||
                  isSubmitting
                }
              >
                {isSubmitting ? 'Adding...' : 'Add Example'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Examples List */}
      {examples.length === 0 ? (
        <div className='text-center py-8 border rounded-lg bg-muted/10'>
          <Tag className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
          <p className='text-sm text-muted-foreground'>
            No examples yet. Add some to teach your bot your style.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {examples.map((example, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className='border rounded-lg p-3 hover:bg-muted/5 transition-colors'
              >
                <div className='flex items-start justify-between gap-2'>
                  <button
                    className='flex-1 text-left'
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <div className='flex items-center gap-2 mb-1'>
                      <Badge variant='outline' className='text-xs'>
                        {SOURCE_LABELS[example.source]}
                      </Badge>
                      {example.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='text-xs'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className='text-sm text-muted-foreground line-clamp-1'>
                      <span className='font-medium text-foreground'>Q:</span>{' '}
                      {example.context}
                    </p>
                    <p className='text-sm line-clamp-1 mt-0.5'>
                      <span className='font-medium'>A:</span> {example.reply}
                    </p>
                  </button>
                  <div className='flex items-center gap-1 shrink-0'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className='h-3.5 w-3.5' />
                      ) : (
                        <ChevronDown className='h-3.5 w-3.5' />
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-destructive hover:text-destructive'
                          disabled={isLoading}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Example</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this example? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(index)}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className='mt-3 pt-3 border-t space-y-3'>
                    <div>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        Full Context
                      </p>
                      <p className='text-sm bg-muted/30 rounded-md p-2'>
                        {example.context}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-medium text-muted-foreground mb-1'>
                        Full Reply
                      </p>
                      <p className='text-sm bg-primary/5 rounded-md p-2'>
                        {example.reply}
                      </p>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Added {new Date(example.added_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
