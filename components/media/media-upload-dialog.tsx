'use client';

import { useState, useRef, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Upload,
  X,
  FileText,
  Music,
  Video as VideoIcon,
  File,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaApi } from '@/lib/api/media';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'audio/aac',
  'audio/mp4',
  'audio/wav',
  'video/mp4',
  'video/ogg',
  'video/x-msvideo',
  'video/quicktime',
  'video/webm',
  'application/pdf',
];

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const validateFile = (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description:
          'Please upload a supported file type (Image, Video, Audio, or PDF).',
      });
      return false;
    }

    // Instagram Limits:
    // Image: 8MB
    // Video: 25MB
    // Audio: 25MB
    // PDF: 25MB
    let limit = 25 * 1024 * 1024; // Default 25MB
    let limitLabel = '25MB';

    if (file.type.startsWith('image/')) {
      limit = 8 * 1024 * 1024;
      limitLabel = '8MB';
    }

    if (file.size > limit) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `File size must be less than ${limitLabel} for ${file.type.split('/')[0]}s (Instagram limit).`,
      });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setName(selectedFile.name.split('.')[0]); // Default name to filename
      } else {
        // Reset input
        e.target.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await MediaApi.upload(
        file,
        {
          name,
          description,
          alt_text: altText,
          tags: tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
        },
        progress => setUploadProgress(progress),
        abortController.signal
      );
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
      setUploadProgress(0);
      onUploadSuccess();
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        toast({
          title: 'Cancelled',
          description: 'Upload cancelled',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error.response?.data?.message || 'Failed to upload media',
        });
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={URL.createObjectURL(file)}
          alt='Preview'
          className='h-full w-full object-cover rounded'
        />
      );
    }
    if (file.type.startsWith('video/')) {
      return <VideoIcon className='h-5 w-5 text-muted-foreground' />;
    }
    if (file.type.startsWith('audio/')) {
      return <Music className='h-5 w-5 text-muted-foreground' />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className='h-5 w-5 text-muted-foreground' />;
    }
    return <File className='h-5 w-5 text-muted-foreground' />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Upload Media
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
        </DialogHeader>

        <ScrollArea className='flex-1 -mr-4 pr-4 min-h-0'>
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

                <div className='mt-6 text-xs text-muted-foreground bg-muted/30 p-4 rounded-md text-left w-full max-w-[350px] mx-auto'>
                  <p className='font-semibold mb-2 text-center'>
                    Supported Media Types & Limits
                  </p>
                  <ul className='space-y-1.5 list-disc pl-4'>
                    <li>
                      <span className='font-medium text-foreground/80'>
                        Images:
                      </span>{' '}
                      JPEG, PNG{' '}
                      <span className='text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded ml-1'>
                        Max 8MB
                      </span>
                    </li>
                    <li>
                      <span className='font-medium text-foreground/80'>
                        Audio:
                      </span>{' '}
                      AAC, MP4, WAV{' '}
                      <span className='text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded ml-1'>
                        Max 25MB
                      </span>
                    </li>
                    <li>
                      <span className='font-medium text-foreground/80'>
                        Video:
                      </span>{' '}
                      MP4, MOV, AVI, OGG, WebM{' '}
                      <span className='text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded ml-1'>
                        Max 25MB
                      </span>
                    </li>
                    <li>
                      <span className='font-medium text-foreground/80'>
                        Documents:
                      </span>{' '}
                      PDF{' '}
                      <span className='text-xs bg-muted-foreground/10 px-1.5 py-0.5 rounded ml-1'>
                        Max 25MB
                      </span>
                    </li>
                  </ul>
                </div>

                <Input
                  id='file-upload'
                  type='file'
                  className='hidden'
                  accept={ALLOWED_MIME_TYPES.join(',')}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center space-x-4 overflow-hidden'>
                    <div className='h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0'>
                      {renderFilePreview(file)}
                    </div>
                    <div className='truncate'>
                      <p className='text-sm font-medium truncate'>
                        {file.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setFile(null)}
                    className='cursor-pointer'
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
        </ScrollArea>

        <DialogFooter>
          {isUploading ? (
            <div className='w-full flex flex-col gap-2'>
              <div className='flex items-center justify-between text-sm'>
                <span>Uploading... {uploadProgress}%</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCancelUpload}
                  className='h-auto p-0 text-muted-foreground hover:text-foreground'
                >
                  Cancel
                </Button>
              </div>
              <Progress value={uploadProgress} className='h-2' />
            </div>
          ) : (
            <>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                Upload
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
