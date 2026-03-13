'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash,
  FileText,
  Pencil,
  Upload,
  Link,
  File,
  Loader2,
} from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { KnowledgeSource } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCostBadge,
  CREDIT_COSTS,
} from '@/components/ui/credit-cost-badge';

// ─── Source type badge ────────────────────────────────────────────────────────

const SOURCE_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    variant: 'default' | 'secondary' | 'outline';
  }
> = {
  text: { label: 'Text', icon: FileText, variant: 'secondary' },
  pdf: { label: 'PDF', icon: File, variant: 'default' },
  docx: { label: 'DOCX', icon: File, variant: 'default' },
  url: { label: 'URL', icon: Link, variant: 'outline' },
  faq: { label: 'FAQ', icon: FileText, variant: 'secondary' },
};

function SourceTypeBadge({ type }: { type: string }) {
  const cfg = SOURCE_TYPE_CONFIG[type] ?? SOURCE_TYPE_CONFIG['text'];
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className='text-xs gap-1 capitalize'>
      <Icon className='h-3 w-3' />
      {cfg.label}
    </Badge>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BotKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addTab, setAddTab] = useState<'text' | 'file' | 'url'>('text');
  const [isSaving, setIsSaving] = useState(false);

  // Text form
  const [textForm, setTextForm] = useState({ title: '', content: '' });

  // File form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');

  // URL form
  const [urlForm, setUrlForm] = useState({ title: '', url: '' });

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
      if (response?.data) setSources(response.data);
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

  const resetAddForms = () => {
    setTextForm({ title: '', content: '' });
    setSelectedFile(null);
    setFileTitle('');
    setUrlForm({ title: '', url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Add: Text ──────────────────────────────────────────────────────────────

  const handleAddText = async () => {
    if (!textForm.title || !textForm.content) return;
    setIsSaving(true);
    try {
      const response = await IntelligenceApi.addKnowledgeSource(
        botId,
        textForm
      );
      if (response?.data) {
        setSources(prev => [...prev, response.data]);
        resetAddForms();
        setIsAddDialogOpen(false);
        toast({
          title: 'Added',
          description: 'Text source added successfully.',
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
      setIsSaving(false);
    }
  };

  // ── Add: File ──────────────────────────────────────────────────────────────

  const handleAddFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const response = await IntelligenceApi.addKnowledgeSourceFromFile(
        botId,
        selectedFile,
        fileTitle || undefined
      );
      if (response?.data) {
        setSources(prev => [...prev, response.data]);
        resetAddForms();
        setIsAddDialogOpen(false);
        toast({
          title: 'Added',
          description: `"${response.data.title}" parsed and added.`,
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
      setIsSaving(false);
    }
  };

  // ── Add: URL ───────────────────────────────────────────────────────────────

  const handleAddUrl = async () => {
    if (!urlForm.title || !urlForm.url) return;
    setIsSaving(true);
    try {
      const response = await IntelligenceApi.addKnowledgeSourceFromUrl(
        botId,
        urlForm
      );
      if (response?.data) {
        setSources(prev => [...prev, response.data]);
        resetAddForms();
        setIsAddDialogOpen(false);
        toast({
          title: 'Added',
          description: `Page scraped and added successfully.`,
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
      setIsSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const openEditDialog = (source: KnowledgeSource) => {
    setEditingSource(source);
    setEditForm({
      title: source.title,
      content: source.raw_content || source.content_preview || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;
    setIsUpdating(true);
    try {
      const response = await IntelligenceApi.updateKnowledgeSource(
        botId,
        editingSource._id,
        editForm
      );
      if (response?.data) {
        setSources(prev =>
          prev.map(s => (s._id === editingSource._id ? response.data : s))
        );
        setIsEditDialogOpen(false);
        setEditingSource(null);
        toast({ title: 'Updated', description: 'Knowledge source updated.' });
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

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Delete this knowledge source?')) return;
    try {
      await IntelligenceApi.removeKnowledgeSource(botId, sourceId);
      setSources(prev => prev.filter(s => s._id !== sourceId));
      toast({ title: 'Deleted', description: 'Knowledge source removed.' });
    } catch (_error) {
      const err = parseApiError(_error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className='p-4 sm:p-6 space-y-6'>
        <Skeleton className='h-8 w-32' />
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className='h-36 w-full' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
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
              Teach your bot — add text, upload documents, or scrape URLs.
            </p>
          </div>
        </div>
        <Button
          className='shrink-0 self-start sm:self-auto'
          onClick={() => {
            resetAddForms();
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Source
        </Button>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add Knowledge Source</DialogTitle>
            <DialogDescription>
              Enter text manually, upload a document, or scrape a web page.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={addTab}
            onValueChange={v => setAddTab(v as typeof addTab)}
          >
            <TabsList className='w-full'>
              <TabsTrigger value='text' className='flex-1 gap-1.5'>
                <FileText className='h-3.5 w-3.5' /> Text
              </TabsTrigger>
              <TabsTrigger value='file' className='flex-1 gap-1.5'>
                <Upload className='h-3.5 w-3.5' /> File
              </TabsTrigger>
              <TabsTrigger value='url' className='flex-1 gap-1.5'>
                <Link className='h-3.5 w-3.5' /> URL
              </TabsTrigger>
            </TabsList>

            {/* ── Text tab ── */}
            <TabsContent value='text' className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label>Title</Label>
                <Input
                  placeholder='e.g. Pricing Policy'
                  value={textForm.title}
                  onChange={e =>
                    setTextForm({ ...textForm, title: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>Content</Label>
                <Textarea
                  placeholder='Paste or write your content here...'
                  className='h-40'
                  value={textForm.content}
                  onChange={e =>
                    setTextForm({ ...textForm, content: e.target.value })
                  }
                />
              </div>
              <DialogFooter className='pt-2'>
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
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddText}
                  disabled={isSaving || !textForm.title || !textForm.content}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Adding...
                    </>
                  ) : (
                    'Add Source'
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ── File tab ── */}
            <TabsContent value='file' className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label>
                  File{' '}
                  <span className='text-muted-foreground font-normal'>
                    (PDF, DOCX, TXT — max 10 MB)
                  </span>
                </Label>
                <div
                  className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors'
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className='flex items-center justify-center gap-2'>
                      <File className='h-5 w-5 text-primary' />
                      <span className='text-sm font-medium'>
                        {selectedFile.name}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                      <p className='text-sm text-muted-foreground'>
                        Click to select a file
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        PDF, DOCX, or TXT
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
                    className='hidden'
                    onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label>
                  Title{' '}
                  <span className='text-muted-foreground font-normal'>
                    (optional — defaults to filename)
                  </span>
                </Label>
                <Input
                  placeholder='e.g. Product Manual'
                  value={fileTitle}
                  onChange={e => setFileTitle(e.target.value)}
                />
              </div>
              <DialogFooter className='pt-2'>
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
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFile}
                  disabled={isSaving || !selectedFile}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Parsing...
                    </>
                  ) : (
                    'Upload & Parse'
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            {/* ── URL tab ── */}
            <TabsContent value='url' className='space-y-4 pt-2'>
              <div className='space-y-2'>
                <Label>Title</Label>
                <Input
                  placeholder='e.g. Features Page'
                  value={urlForm.title}
                  onChange={e =>
                    setUrlForm({ ...urlForm, title: e.target.value })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>URL</Label>
                <Input
                  type='url'
                  placeholder='https://postengage.ai/features'
                  value={urlForm.url}
                  onChange={e =>
                    setUrlForm({ ...urlForm, url: e.target.value })
                  }
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                The page will be scraped and its text extracted. Works best on
                public, static pages.
              </p>
              <DialogFooter className='pt-2'>
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
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUrl}
                  disabled={isSaving || !urlForm.title || !urlForm.url}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Scraping...
                    </>
                  ) : (
                    'Scrape & Add'
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Source Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge Source</DialogTitle>
            <DialogDescription>
              Update the title or content of this source.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={e =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label>Content</Label>
              <Textarea
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
              {isUpdating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sources grid */}
      {sources.length === 0 ? (
        <div className='text-center py-16 border-2 border-dashed rounded-xl bg-muted/5'>
          <div className='h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4'>
            <FileText className='h-8 w-8 text-primary' />
          </div>
          <h3 className='text-lg font-semibold'>No knowledge sources</h3>
          <p className='text-sm text-muted-foreground mt-2 mb-6 max-w-sm mx-auto'>
            Add text, upload documents, or scrape web pages to teach your bot.
          </p>
          <Button
            onClick={() => {
              resetAddForms();
              setIsAddDialogOpen(true);
            }}
          >
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
                <CardDescription className='flex items-center gap-2'>
                  <SourceTypeBadge type={source.source_type} />
                  <span>{source.processed_chunks?.length || 0} chunks</span>
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
