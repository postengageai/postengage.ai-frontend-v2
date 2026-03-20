'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, ChevronUp, Loader2, UserPlus, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LeadsApi } from '@/lib/api/leads';
import { SocialAccountsApi } from '@/lib/api/social-accounts';
import type { SocialAccount } from '@/lib/api/social-accounts';
import type { Lead, CreateLeadRequest, CaptureSource } from '@/lib/types/leads';
import type { SocialPlatform } from '@/lib/types/settings';
import { toast } from 'sonner';

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
};

const CAPTURE_SOURCES: { value: CaptureSource; label: string }[] = [
  { value: 'comment', label: 'Comment' },
  { value: 'dm', label: 'Direct Message' },
  { value: 'reel', label: 'Reel' },
  { value: 'story', label: 'Story' },
  { value: 'post', label: 'Post' },
];

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
];

interface AddLeadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (lead: Lead) => void;
}

export function AddLeadSheet({
  open,
  onOpenChange,
  onSuccess,
}: AddLeadSheetProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState<{
    social_account_id: string;
    platform: SocialPlatform | '';
    platform_user_id: string;
    username: string;
    full_name: string;
    capture_source: CaptureSource | '';
    tags: string[];
    tagInput: string;
    post_url: string;
    matched_keywords: string;
    comment_id: string;
    engagement_type: string;
    notes: string;
  }>({
    social_account_id: '',
    platform: '',
    platform_user_id: '',
    username: '',
    full_name: '',
    capture_source: '',
    tags: [],
    tagInput: '',
    post_url: '',
    matched_keywords: '',
    comment_id: '',
    engagement_type: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadAccounts();
      resetForm();
    }
  }, [open]);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await SocialAccountsApi.list({ status: 'connected' });
      setAccounts(res.data ?? []);
    } catch {
      // silent
    } finally {
      setLoadingAccounts(false);
    }
  };

  const resetForm = () => {
    setForm({
      social_account_id: '',
      platform: '',
      platform_user_id: '',
      username: '',
      full_name: '',
      capture_source: '',
      tags: [],
      tagInput: '',
      post_url: '',
      matched_keywords: '',
      comment_id: '',
      engagement_type: '',
      notes: '',
    });
    setShowAdvanced(false);
  };

  const handleAccountChange = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    setForm(prev => ({
      ...prev,
      social_account_id: accountId,
      platform: acc?.platform ?? '',
    }));
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t || form.tags.includes(t)) return;
    setForm(prev => ({ ...prev, tags: [...prev.tags, t], tagInput: '' }));
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(form.tagInput);
    }
  };

  const getTagColor = (tag: string) =>
    TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length];

  const handleSubmit = async () => {
    if (
      !form.social_account_id ||
      !form.platform ||
      !form.username ||
      !form.capture_source
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const keywords = form.matched_keywords
        ? form.matched_keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean)
        : undefined;

      const payload: CreateLeadRequest = {
        socialAccountId: form.social_account_id,
        platform: form.platform as SocialPlatform,
        platformUserId: form.platform_user_id || form.username,
        username: form.username,
        fullName: form.full_name || undefined,
        capturedFrom: form.capture_source as CaptureSource,
        tags: form.tags.length ? form.tags : undefined,
        metadata: {
          post_url: form.post_url || undefined,
          keywords,
          comment_id: form.comment_id || undefined,
          engagement_type: form.engagement_type || undefined,
        },
        notes: form.notes || undefined,
      };
      const res = await LeadsApi.createLead(payload);
      toast.success('Lead added successfully');
      onSuccess?.(res.data);
      onOpenChange(false);
    } catch {
      toast.error('Failed to add lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <UserPlus className='h-4 w-4' />
            Add Lead
          </SheetTitle>
          <SheetDescription>Manually add a lead to your CRM.</SheetDescription>
        </SheetHeader>

        <ScrollArea className='flex-1 py-4'>
          <div className='space-y-5 pr-4'>
            {/* Social Account */}
            <div className='space-y-1.5'>
              <Label>
                Social Account <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.social_account_id}
                onValueChange={handleAccountChange}
                disabled={loadingAccounts}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingAccounts ? 'Loading accounts…' : 'Select account'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      @{acc.username} (
                      {PLATFORM_LABELS[acc.platform] ?? acc.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform (auto-filled, read-only) */}
            <div className='space-y-1.5'>
              <Label>Platform</Label>
              <Input
                value={
                  form.platform
                    ? (PLATFORM_LABELS[form.platform] ?? form.platform)
                    : ''
                }
                placeholder='Auto-filled from account'
                readOnly
                className='bg-muted/50'
              />
            </div>

            {/* Platform User ID + Username */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label>Platform User ID</Label>
                <Input
                  placeholder='e.g. 123456789'
                  value={form.platform_user_id}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      platform_user_id: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label>
                  Username <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder='@username'
                  value={form.username}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      username: e.target.value.replace('@', ''),
                    }))
                  }
                />
              </div>
            </div>

            {/* Full Name + Captured From */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label>Full Name</Label>
                <Input
                  placeholder='Display name'
                  value={form.full_name}
                  onChange={e =>
                    setForm(prev => ({ ...prev, full_name: e.target.value }))
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label>
                  Captured From <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={form.capture_source}
                  onValueChange={val =>
                    setForm(prev => ({
                      ...prev,
                      capture_source: val as CaptureSource,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select source' />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPTURE_SOURCES.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className='space-y-2'>
              <Label>Tags</Label>
              {form.tags.length > 0 && (
                <div className='flex flex-wrap gap-1.5 pb-1'>
                  {form.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant='outline'
                      className={`gap-1 pr-1 ${getTagColor(tag)}`}
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                placeholder='Type tag and press Enter…'
                value={form.tagInput}
                onChange={e =>
                  setForm(prev => ({ ...prev, tagInput: e.target.value }))
                }
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (form.tagInput.trim()) addTag(form.tagInput);
                }}
              />
            </div>

            <Separator />

            {/* Advanced section */}
            <button
              type='button'
              onClick={() => setShowAdvanced(v => !v)}
              className='flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground'
            >
              <span>Advanced — Add context (optional)</span>
              {showAdvanced ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </button>

            {showAdvanced && (
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label>Original Post URL</Label>
                  <Input
                    placeholder='https://www.instagram.com/p/...'
                    value={form.post_url}
                    onChange={e =>
                      setForm(prev => ({ ...prev, post_url: e.target.value }))
                    }
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label>Matched Keywords</Label>
                  <Input
                    placeholder='keyword1, keyword2'
                    value={form.matched_keywords}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        matched_keywords: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1.5'>
                    <Label>Comment ID</Label>
                    <Input
                      placeholder='Optional'
                      value={form.comment_id}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          comment_id: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Engagement Type</Label>
                    <Input
                      placeholder='e.g. reply, mention'
                      value={form.engagement_type}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          engagement_type: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <Label>Notes</Label>
                  <Input
                    placeholder='Internal notes…'
                    value={form.notes}
                    onChange={e =>
                      setForm(prev => ({ ...prev, notes: e.target.value }))
                    }
                  />
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
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Add Lead
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
