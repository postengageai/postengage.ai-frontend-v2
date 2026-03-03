'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { leadsApi } from '@/lib/api/leads';
import { useToast } from '@/hooks/use-toast';

interface LeadTagManagerProps {
  leadId: string;
  tags: readonly string[];
  onTagsChange?: (leadId: string, tags: string[]) => void;
}

export function LeadTagManager({
  leadId,
  tags,
  onTagsChange,
}: LeadTagManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>(Array.from(tags));
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTag.trim() || localTags.includes(newTag.trim())) {
      return;
    }

    const updatedTags = [...localTags, newTag.trim()];
    setIsLoading(true);

    try {
      await leadsApi.addLeadTags(leadId, { tags: updatedTags });
      setLocalTags(updatedTags);
      setNewTag('');
      onTagsChange?.(leadId, updatedTags);
      toast({
        title: 'Success',
        description: 'Tag added successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add tag',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = localTags.filter(t => t !== tagToRemove);
    setIsLoading(true);

    try {
      await leadsApi.addLeadTags(leadId, { tags: updatedTags });
      setLocalTags(updatedTags);
      onTagsChange?.(leadId, updatedTags);
      toast({
        title: 'Success',
        description: 'Tag removed successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove tag',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap gap-1'>
          {localTags.map(tag => (
            <Badge
              key={tag}
              variant='secondary'
              className='cursor-pointer hover:bg-secondary/80'
              onClick={() => handleRemoveTag(tag)}
            >
              {tag}
              <X className='h-3 w-3 ml-1' />
            </Badge>
          ))}
        </div>
        <form onSubmit={handleAddTag} className='flex gap-1'>
          <Input
            ref={inputRef}
            type='text'
            placeholder='Add tag...'
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            className='h-7 text-xs'
            disabled={isLoading}
          />
          <Button
            type='submit'
            size='sm'
            disabled={!newTag.trim() || isLoading}
            className='h-7'
          >
            <Plus className='h-3 w-3' />
          </Button>
          <Button
            type='button'
            size='sm'
            variant='ghost'
            onClick={() => {
              setIsEditing(false);
              setNewTag('');
            }}
            className='h-7'
          >
            Done
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className='flex flex-wrap gap-1 cursor-pointer hover:opacity-80 transition-opacity'
    >
      {localTags.length === 0 ? (
        <span className='text-xs text-muted-foreground'>No tags</span>
      ) : (
        localTags.map(tag => (
          <Badge key={tag} variant='outline' className='text-xs'>
            {tag}
          </Badge>
        ))
      )}
    </div>
  );
}
