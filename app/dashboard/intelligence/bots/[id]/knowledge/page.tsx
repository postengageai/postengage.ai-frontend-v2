'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash, FileText, Pencil } from 'lucide-react';
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
import { parseApiError } from '@/lib/http/errors';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCostBadge,
  CREDIT_COSTS,
} from '@/components/ui/credit-cost-badge';

export default function BotKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add dialog state
  const [isAdding, setIsAdding] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', content: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Edit dialog state
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(
    null
  );
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
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
        setIsAddDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Knowledge source added successfully',
        });
      }
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const openEditDialog = (source: KnowledgeSource) => {
    setEditingSource(source);
    setEditForm({
      title: source.title,
      content: source.raw_content || source.content_preview || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource || (!editForm.title && !editForm.content)) return;

    setIsUpdating(true);
    try {
      const response = await IntelligenceApi.updateKnowledgeSource(
        botId,
        editingSource._id,
        editForm
      );
      if (response && response.data) {
        setSources(
          sources.map(s => (s._id === editingSource._id ? response.data : s))
        );
        setIsEditDialogOpen(false);
        setEditingSource(null);
        toast({
          title: 'Success',
          description: 'Knowledge source updated successfully',
        });
      }
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsUpdating(false);
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
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className='p-4 sm:p-6 space-y-6'>
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
    <div className='p-4 sm:p-6 space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-3 min-w-0'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.back()}
            className='shrink-0'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='min-w-0'>
            <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
              Knowledge Base
            </h1>
            <p className='text-sm text-muted-foreground'>
              Teach your bot about your business.
            </p>
          </div>
        </div>

        {/* Add Source Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='shrink-0 self-start sm:self-auto'>
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
                  className='h-40'
                  value={newSource.content}
                  onChange={e =>
                    setNewSource({ ...newSource, content: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <div className='flex-1 flex items-center'>
                <CreditCostBadge
                  amount={CREDIT_COSTS.KNOWLEDGE_SOURCE}
                  label='to process'
                  size='xs'
                />
              </div>
              <Button
                variant='outline'
                onClick={() => setIsAddDialogOpen(false)}
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

      {/* Edit Source Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge Source</DialogTitle>
            <DialogDescription>
              Update the title or content of this knowledge source.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-title'>Title</Label>
              <Input
                id='edit-title'
                value={editForm.title}
                onChange={e =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-content'>Content</Label>
              <Textarea
                id='edit-content'
                className='h-48'
                value={editForm.content}
                onChange={e =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSource} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sources.length === 0 ? (
        <div className='text-center py-16 border-2 border-dashed rounded-xl bg-muted/5'>
          <div className='h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4'>
            <FileText className='h-8 w-8 text-primary' />
          </div>
          <h3 className='text-lg font-semibold'>No knowledge sources</h3>
          <p className='text-sm text-muted-foreground mt-2 mb-6 max-w-sm mx-auto'>
            Add documents or text to train your bot with your business
            knowledge.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add First Source
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {sources.map(source => (
            <Card key={source._id} className='flex flex-col'>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start gap-2'>
                  <CardTitle className='text-base font-medium line-clamp-2 flex-1'>
                    {source.title}
                  </CardTitle>
                  <div className='flex items-center gap-1 shrink-0'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-foreground'
                      onClick={() => openEditDialog(source)}
                    >
                      <Pencil className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive'
                      onClick={() => handleDeleteSource(source._id)}
                    >
                      <Trash className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {source.source_type.toUpperCase()} •{' '}
                  {source.processed_chunks?.length || 0} chunks
                </CardDescription>
              </CardHeader>
              <CardContent className='flex-1'>
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
