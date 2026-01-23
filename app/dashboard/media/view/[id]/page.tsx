'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MediaApi, Media } from '@/lib/api/media';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MediaViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        if (typeof params.id === 'string') {
          const response = await MediaApi.get(params.id);
          if (response.data) {
            setMedia(response.data);
          }
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load media details',
        });
        router.push('/dashboard/media');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [params.id, router, toast]);

  if (isLoading) {
    return (
      <div className='flex h-[80vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!media) {
    return null;
  }

  const isPdf = media.mime_type === 'application/pdf';
  const isImage = media.mime_type.startsWith('image/');
  const isVideo = media.mime_type.startsWith('video/');
  const isAudio = media.mime_type.startsWith('audio/');

  return (
    <div className='flex flex-col h-[calc(100vh-4rem)] space-y-4'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-xl font-semibold'>{media.name}</h1>
            <p className='text-sm text-muted-foreground'>
              {(media.size / 1024 / 1024).toFixed(2)} MB •{' '}
              {new Date(media.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          onClick={() => window.open(media.url, '_blank')}
        >
          <Download className='mr-2 h-4 w-4' />
          Download
        </Button>
      </div>

      <div className='flex-1 bg-muted/10 rounded-lg overflow-hidden border'>
        {isPdf ? (
          <iframe
            src={media.url}
            className='w-full h-full'
            title={media.name}
          />
        ) : isImage ? (
          <div className='flex h-full items-center justify-center p-4'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.url}
              alt={media.alt_text || media.name}
              className='max-h-full max-w-full object-contain shadow-lg rounded-lg'
            />
          </div>
        ) : isVideo ? (
          <div className='flex h-full items-center justify-center p-4'>
            <video
              src={media.url}
              controls
              className='max-h-full max-w-full rounded-lg shadow-lg'
            />
          </div>
        ) : isAudio ? (
          <div className='flex h-full items-center justify-center p-4'>
            <audio src={media.url} controls className='w-full max-w-md' />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
            <FileText className='h-16 w-16 mb-4' />
            <p>Preview not available</p>
            <Button
              variant='link'
              onClick={() => window.open(media.url, '_blank')}
            >
              Open file
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
