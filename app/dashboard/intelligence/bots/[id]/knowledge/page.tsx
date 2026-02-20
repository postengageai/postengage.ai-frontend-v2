'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { KnowledgeSource } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BotKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', content: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const botId = params.id as string;

  useEffect(() => {
    fetchSources();
  }, [botId]);

  const fetchSources = async () => {
    try {
      const response = await IntelligenceApi.getKnowledgeSources(botId);
      if (response && response.data) {
        setSources(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load knowledge sources',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!newSource.title || !newSource.content) return;

    setIsAdding(true);
    try {
      const response = await IntelligenceApi.addKnowledgeSource(
        botId,
        newSource
      );
      if (response && response.data) {
        setSources([...sources, response.data]);
        setNewSource({ title: '', content: '' });
        setIsDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Knowledge source added successfully',
        });
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add knowledge source',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;

    try {
      await IntelligenceApi.removeKnowledgeSource(botId, sourceId);
      setSources(sources.filter(s => s._id !== sourceId));
      toast({
        title: 'Success',
        description: 'Knowledge source deleted successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete knowledge source',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <Skeleton className='h-8 w-32' />
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className='h-32 w-full' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Knowledge Base
            </h1>
            <p className='text-muted-foreground'>
              Teach your bot about your business.
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Knowledge Source</DialogTitle>
              <DialogDescription>
                Add text content that your bot can use to answer questions.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Input
                  id='title'
                  placeholder='e.g. Pricing Policy'
                  value={newSource.title}
                  onChange={e =>
                    setNewSource({ ...newSource, title: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='content'>Content</Label>
                <Textarea
                  id='content'
                  placeholder='Enter the full text content...'
                  className='h-32'
                  value={newSource.content}
                  onChange={e =>
                    setNewSource({ ...newSource, content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDialogOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSource} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Source'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sources.length === 0 ? (
        <div className='text-center py-12 border rounded-lg bg-muted/10'>
          <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium'>No knowledge sources</h3>
          <p className='text-muted-foreground mt-2 mb-6'>
            Add documents or text to train your bot.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Add Source</Button>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {sources.map(source => (
            <Card key={source._id}>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                  <CardTitle className='text-lg font-medium truncate pr-4'>
                    {source.title}
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive hover:text-destructive'
                    onClick={() => handleDeleteSource(source._id)}
                  >
                    <Trash className='h-4 w-4' />
                  </Button>
                </div>
                <CardDescription>
                  {source.source_type.toUpperCase()} •{' '}
                  {source.processed_chunks?.length || 0} chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground line-clamp-3'>
                  {source.content_preview ||
                    source.raw_content ||
                    'No preview available'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
