'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaApi, Media } from '@/lib/api/media';

interface MediaEditDialogProps {
  media: Media | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedMedia: Media) => void;
}

export function MediaEditDialog({
  media,
  open,
  onOpenChange,
  onUpdate,
}: MediaEditDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (media) {
      setName(media.name || '');
      setDescription(media.description || '');
      setAltText(media.alt_text || '');
      setTags(media.tags?.join(', ') || '');
    }
  }, [media]);

  const handleSave = async () => {
    if (!media) return;

    setIsSaving(true);
    try {
      const updatedMedia = await MediaApi.update(media.id, {
        name,
        description,
        alt_text: altText,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      });
      toast({
        title: 'Success',
        description: 'Media updated successfully',
      });
      onUpdate(updatedMedia.data);
      onOpenChange(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update media',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!media) return null;

  const isImage = media.mime_type.startsWith('image/');
  const isVideo = media.mime_type.startsWith('video/');
  const isAudio = media.mime_type.startsWith('audio/');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Edit Media</DialogTitle>
        </DialogHeader>

        <ScrollArea className='flex-1 -mr-4 pr-4 min-h-0'>
          <div className='grid gap-4 py-4'>
            <div className='relative overflow-hidden rounded-lg border bg-muted'>
              <div className='flex items-center justify-center p-4 min-h-[200px]'>
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.name}
                    className='max-h-[300px] w-full object-contain'
                  />
                ) : isVideo ? (
                  <video
                    src={media.url}
                    controls
                    className='max-h-[300px] w-full'
                  />
                ) : isAudio ? (
                  <div className='flex w-full flex-col items-center gap-4'>
                    <Music className='h-12 w-12 text-muted-foreground' />
                    <audio src={media.url} controls className='w-full' />
                  </div>
                ) : (
                  <div className='flex flex-col items-center gap-2 text-muted-foreground py-8'>
                    <FileText className='h-16 w-16' />
                    <p className='text-sm font-medium mt-2'>{media.name}</p>
                    <p className='text-xs'>
                      {(media.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='altText'>Alt Text (Optional)</Label>
              <Input
                id='altText'
                value={altText}
                onChange={e => setAltText(e.target.value)}
                placeholder='Alternative text for accessibility'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='tags'>Tags (Optional)</Label>
              <Input
                id='tags'
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder='Comma separated tags (e.g. social, marketing)'
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
