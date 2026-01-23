'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaApi } from '@/lib/api/media';

interface MediaUploadDialogProps {
  onUploadSuccess: () => void;
}

export function MediaUploadDialog({ onUploadSuccess }: MediaUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setName(selectedFile.name.split('.')[0]); // Default name to filename
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setName(selectedFile.name.split('.')[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      await MediaApi.upload(file, {
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
        description: 'Media uploaded successfully',
      });
      setOpen(false);
      setFile(null);
      setName('');
      setDescription('');
      setAltText('');
      setTags('');
      onUploadSuccess();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload media',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {!file ? (
            <div
              className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer'
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className='h-10 w-10 text-muted-foreground mx-auto mb-4' />
              <p className='text-sm text-muted-foreground'>
                Drag and drop your file here, or click to select
              </p>
              <Input
                id='file-upload'
                type='file'
                className='hidden'
                accept='image/*,video/*'
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center space-x-4 overflow-hidden'>
                  <div className='h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0'>
                    {file.type.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(file)}
                        alt='Preview'
                        className='h-full w-full object-cover rounded'
                      />
                    ) : (
                      <Upload className='h-5 w-5 text-muted-foreground' />
                    )}
                  </div>
                  <div className='truncate'>
                    <p className='text-sm font-medium truncate'>{file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setFile(null)}
                >
                  <X className='h-4 w-4' />
                </Button>
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
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
