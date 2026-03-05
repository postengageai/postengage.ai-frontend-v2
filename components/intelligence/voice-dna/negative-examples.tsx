'use client';

import { useState } from 'react';
import { Plus, Trash2, Ban } from 'lucide-react';
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
import type {
  NegativeExample,
  AddNegativeExampleDto,
} from '@/lib/types/voice-dna';

interface NegativeExamplesProps {
  examples: NegativeExample[];
  onAdd: (dto: AddNegativeExampleDto) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  isLoading?: boolean;
}

export function NegativeExamples({
  examples,
  onAdd,
  onDelete,
  isLoading,
}: NegativeExamplesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExample, setNewExample] = useState({
    reply: '',
    reason: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newExample.reply.trim() || !newExample.reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        reply: newExample.reply.trim(),
        reason: newExample.reason.trim(),
        tags: newExample.tags
          ? newExample.tags
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : undefined,
      });
      setNewExample({ reply: '', reason: '', tags: '' });
      setIsAddOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-medium'>Negative Examples</h3>
          <p className='text-xs text-muted-foreground mt-1'>
            {examples.length} example{examples.length !== 1 ? 's' : ''} —
            replies your bot should avoid
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size='sm' variant='outline'>
              <Plus className='mr-2 h-4 w-4' />
              Add Negative
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>Add Negative Example</DialogTitle>
              <DialogDescription>
                Add a reply style your bot should never use. Explain why
                it&apos;s bad so the AI learns what to avoid.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='neg-reply'>Bad Reply (what NOT to say)</Label>
                <Textarea
                  id='neg-reply'
                  placeholder='e.g., "Please visit our website for more information. Thank you for your interest."'
                  value={newExample.reply}
                  onChange={e =>
                    setNewExample(prev => ({ ...prev, reply: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='neg-reason'>Reason (why is this bad?)</Label>
                <Textarea
                  id='neg-reason'
                  placeholder='e.g., "Too formal and robotic. Sounds like a corporate chatbot, not me."'
                  value={newExample.reason}
                  onChange={e =>
                    setNewExample(prev => ({ ...prev, reason: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='neg-tags'>
                  Tags (comma-separated, optional)
                </Label>
                <Input
                  id='neg-tags'
                  placeholder='e.g., too-formal, corporate, robotic'
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
                  !newExample.reply.trim() ||
                  !newExample.reason.trim() ||
                  isSubmitting
                }
              >
                {isSubmitting ? 'Adding...' : 'Add Negative Example'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Examples List */}
      {examples.length === 0 ? (
        <div className='text-center py-8 border rounded-lg bg-muted/10'>
          <Ban className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
          <p className='text-sm text-muted-foreground'>
            No negative examples yet. Add replies your bot should avoid.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {examples.map((example, index) => (
            <div
              key={index}
              className='border border-destructive/20 rounded-lg p-3 bg-destructive/5'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    {example.tags.map(tag => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className='text-sm line-through text-muted-foreground'>
                    {example.reply}
                  </p>
                  <p className='text-xs text-destructive mt-1'>
                    Reason: {example.reason}
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Added {new Date(example.added_at).toLocaleDateString()}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive hover:text-destructive shrink-0'
                      disabled={isLoading}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Remove Negative Example
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this negative example?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(index)}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
