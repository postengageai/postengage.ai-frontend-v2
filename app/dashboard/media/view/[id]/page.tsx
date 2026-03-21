'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MediaApi, Media } from '@/lib/api/media';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MediaEditDialog } from '@/components/media/media-edit-dialog';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  X,
  Edit,
  Trash,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import axios from 'axios';

export default function MediaViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [media, setMedia] = useState<Media | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDownloading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDownloading]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        if (typeof params.id === 'string') {
          const response = await MediaApi.get(params.id);
          if (response.data) {
            setMedia(response.data);
          }
        }
      } catch (_error) {
        const err = parseApiError(_error);
        toast({
          variant: 'destructive',
          title: err.title,
          description: err.message,
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

  const handleDownload = async () => {
    if (!media) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await axios.get(media.url, {
        responseType: 'blob',
        onDownloadProgress: progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setDownloadProgress(progress);
          }
        },
        signal: abortController.signal,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', media.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isCancel(error)) {
        toast({
          title: 'Cancelled',
          description: 'Download cancelled',
        });
      } else {
        const err = parseApiError(error);
        toast({
          variant: 'destructive',
          title: err.title,
          description: err.message,
        });
      }
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDelete = async () => {
    if (!media || !confirm('Delete this file? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await MediaApi.delete(media.id);
      toast({ title: 'Deleted', description: 'File removed successfully.' });
      router.push('/dashboard/media');
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => setEditOpen(true)}>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='text-destructive hover:text-destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Trash className='mr-2 h-4 w-4' />
            )}
            Delete
          </Button>
          {isDownloading ? (
            <div className='flex flex-col gap-2 w-40'>
              <div className='flex items-center justify-between text-xs'>
                <span>Downloading... {downloadProgress}%</span>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleCancelDownload}
                  className='h-4 w-4 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
              <Progress value={downloadProgress} className='h-2' />
            </div>
          ) : (
            <Button variant='outline' size='sm' onClick={handleDownload}>
              <Download className='mr-2 h-4 w-4' />
              Download
            </Button>
          )}
        </div>
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

      <MediaEditDialog
        media={media}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={updated => setMedia(updated)}
      />
    </div>
  );
}
