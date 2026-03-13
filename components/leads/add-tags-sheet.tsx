'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LeadsApi } from '@/lib/api/leads';
import type { Lead } from '@/lib/types/leads';
import { toast } from 'sonner';

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
];

const SUGGESTED_TAGS = [
  'Hot Lead',
  'Follow Up',
  'VIP',
  'Interested',
  'Cold',
  'Partner',
  'Influencer',
  'Customer',
];

interface AddTagsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSuccess?: (updatedLead: Lead) => void;
}

export function AddTagsSheet({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: AddTagsSheetProps) {
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setCurrentTags(lead.tags);
    }
  }, [lead]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || currentTags.includes(trimmed)) return;
    setCurrentTags(prev => [...prev, trimmed]);
  };

  const removeTag = (tag: string) => {
    setCurrentTags(prev => prev.filter(t => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    }
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await LeadsApi.updateLeadTags(lead.id, {
        tags: currentTags,
      });
      toast.success('Tags updated successfully');
      onSuccess?.(res.data);
      onOpenChange(false);
    } catch {
      toast.error('Failed to update tags');
    } finally {
      setSaving(false);
    }
  };

  const getTagColor = (tag: string) => {
    const idx = tag.charCodeAt(0) % TAG_COLORS.length;
    return TAG_COLORS[idx];
  };

  const suggestionsToShow = SUGGESTED_TAGS.filter(
    s => !currentTags.includes(s)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <Tag className='h-4 w-4' />
            Manage Tags
          </SheetTitle>
          <SheetDescription>
            {lead
              ? `Add or remove tags for @${lead.username}`
              : 'Manage lead tags'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='flex-1 py-4'>
          <div className='space-y-6 pr-4'>
            {/* Current tags */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Current Tags</Label>
              {currentTags.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  No tags added yet.
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {currentTags.map(tag => (
                    <Badge
                      key={tag}
                      variant='outline'
                      className={`gap-1 pr-1 ${getTagColor(tag)}`}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className='ml-1 rounded-full hover:opacity-70'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Add new tag input */}
            <div className='space-y-2'>
              <Label htmlFor='tag-input' className='text-sm font-medium'>
                Add New Tags
              </Label>
              <Input
                id='tag-input'
                placeholder='Type a tag and press Enter...'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (inputValue.trim()) {
                    addTag(inputValue);
                    setInputValue('');
                  }
                }}
              />
              <p className='text-xs text-muted-foreground'>
                Press Enter or comma to add a tag
              </p>
            </div>

            {/* Suggestions */}
            {suggestionsToShow.length > 0 && (
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Suggestions</Label>
                <div className='flex flex-wrap gap-2'>
                  {suggestionsToShow.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${getTagColor(tag)}`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className='gap-2 border-t pt-4'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Add Tags
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
