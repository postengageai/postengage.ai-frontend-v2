'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Film,
  Layers,
  MessageCircle,
  Mail,
  FileText,
  ExternalLink,
  Tag,
  Calendar,
  Clock,
  Hash,
  Zap,
  Users,
  Plus,
  Trash2,
  Star,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AddTagsSheet } from '@/components/leads/add-tags-sheet';
import { LeadsApi } from '@/lib/api/leads';
import { SocialAccountsApi } from '@/lib/api/social-accounts';
import type { SocialAccount } from '@/lib/api/social-accounts';
import type {
  Lead,
  CaptureSource,
  LeadSocialProfile,
  AddSocialProfileRequest,
} from '@/lib/types/leads';
import type { SocialPlatform } from '@/lib/types/settings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    profileUrl: (u: string) => string;
  }
> = {
  instagram: {
    label: 'Instagram',
    icon: <Instagram className='h-4 w-4' />,
    color: 'text-pink-500',
    profileUrl: u => `https://instagram.com/${u}`,
  },
  twitter: {
    label: 'Twitter / X',
    icon: <Twitter className='h-4 w-4' />,
    color: 'text-sky-500',
    profileUrl: u => `https://x.com/${u}`,
  },
  facebook: {
    label: 'Facebook',
    icon: <Facebook className='h-4 w-4' />,
    color: 'text-blue-600',
    profileUrl: u => `https://facebook.com/${u}`,
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin className='h-4 w-4' />,
    color: 'text-blue-700',
    profileUrl: u => `https://linkedin.com/in/${u}`,
  },
  youtube: {
    label: 'YouTube',
    icon: <Youtube className='h-4 w-4' />,
    color: 'text-red-500',
    profileUrl: u => `https://youtube.com/@${u}`,
  },
  tiktok: {
    label: 'TikTok',
    icon: <Film className='h-4 w-4' />,
    color: 'text-foreground',
    profileUrl: u => `https://tiktok.com/@${u}`,
  },
  pinterest: {
    label: 'Pinterest',
    icon: <Layers className='h-4 w-4' />,
    color: 'text-red-600',
    profileUrl: u => `https://pinterest.com/${u}`,
  },
};

const CAPTURE_CONFIG: Record<
  CaptureSource,
  { label: string; icon: React.ReactNode }
> = {
  comment: { label: 'Comment', icon: <MessageCircle className='h-4 w-4' /> },
  dm: { label: 'Direct Message', icon: <Mail className='h-4 w-4' /> },
  reel: { label: 'Reel', icon: <Film className='h-4 w-4' /> },
  story: { label: 'Story', icon: <Layers className='h-4 w-4' /> },
  post: { label: 'Post', icon: <FileText className='h-4 w-4' /> },
  live: { label: 'Live', icon: <Zap className='h-4 w-4' /> },
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
};

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
];
const getTagColor = (t: string) =>
  TAG_COLORS[t.charCodeAt(0) % TAG_COLORS.length];

// ─── Add Social Profile Dialog ─────────────────────────────────────────────────

function AddProfileDialog({
  open,
  onOpenChange,
  leadId,
  existingPlatforms,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leadId: string;
  existingPlatforms: SocialPlatform[];
  onSuccess: (lead: Lead) => void;
}) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [platformUserId, setPlatformUserId] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      SocialAccountsApi.list({ status: 'connected' })
        .then(r => setAccounts(r.data ?? []))
        .catch(() => {});
      setSelectedAccountId('');
      setPlatformUserId('');
      setUsername('');
    }
  }, [open]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleAdd = async () => {
    if (!selectedAccountId || !username) {
      toast.error('Please select an account and enter the username');
      return;
    }
    setSaving(true);
    try {
      const payload: AddSocialProfileRequest = {
        social_account_id: selectedAccountId,
        platform: selectedAccount!.platform,
        platform_user_id: platformUserId || username,
        username: username.replace('@', ''),
      };
      const res = await LeadsApi.addSocialProfile(leadId, payload);
      toast.success('Social profile linked');
      onSuccess(res.data);
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Failed to link profile');
    } finally {
      setSaving(false);
    }
  };

  // Filter out accounts whose platform is already linked
  const available = accounts.filter(
    a => !existingPlatforms.includes(a.platform)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Link Social Profile
          </DialogTitle>
          <DialogDescription>
            Connect another platform account to this lead.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label>Social Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder='Choose account…' />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <SelectItem value='__none__' disabled>
                    No more accounts to link
                  </SelectItem>
                ) : (
                  available.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      @{acc.username} ({PLATFORM_LABELS[acc.platform]})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {selectedAccount && (
            <div className='rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground'>
              Platform: {PLATFORM_LABELS[selectedAccount.platform]}
            </div>
          )}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Platform User ID</Label>
              <Input
                placeholder='Numeric ID'
                value={platformUserId}
                onChange={e => setPlatformUserId(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Username *</Label>
              <Input
                placeholder='@handle'
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className='gap-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={saving || !selectedAccountId || !username}
          >
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Link Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [removingProfileId, setRemovingProfileId] = useState<string | null>(
    null
  );
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await LeadsApi.getLead(id);
        setLead(res.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleRemoveProfile = async (profile: LeadSocialProfile) => {
    if (!lead || lead.social_profiles.length <= 1) {
      toast.error("Can't remove the only linked profile");
      return;
    }
    setRemovingProfileId(profile.id);
    try {
      const res = await LeadsApi.removeSocialProfile(lead.id, profile.id);
      setLead(res.data);
      toast.success('Profile unlinked');
    } catch {
      toast.error('Failed to unlink profile');
    } finally {
      setRemovingProfileId(null);
    }
  };

  const handleSetPrimary = async (profile: LeadSocialProfile) => {
    if (!lead || profile.is_primary) return;
    setSettingPrimaryId(profile.id);
    try {
      const res = await LeadsApi.setPrimaryProfile(lead.id, profile.id);
      setLead(res.data);
      toast.success('Primary profile updated');
    } catch {
      toast.error('Failed to update primary profile');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className='flex flex-col gap-6 p-6'>
        <Skeleton className='h-5 w-24' />
        <div className='rounded-xl border p-6'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-28' />
            </div>
          </div>
        </div>
        <Skeleton className='h-40 rounded-xl' />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────

  if (notFound || !lead) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 p-6'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
          <Users className='h-8 w-8 text-muted-foreground' />
        </div>
        <div className='text-center'>
          <p className='text-lg font-semibold'>Lead not found</p>
          <p className='text-sm text-muted-foreground'>
            This lead may have been removed or doesn't exist.
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => router.push('/dashboard/leads')}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Go Back to Leads
        </Button>
      </div>
    );
  }

  const primaryProfile =
    lead.social_profiles.find(p => p.is_primary) ?? lead.social_profiles[0];
  const capCfg = CAPTURE_CONFIG[lead.captured_from];
  const existingPlatforms = lead.social_profiles.map(p => p.platform);

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Back nav */}
      <Link
        href='/dashboard/leads'
        className='flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' />
        Leads
      </Link>

      {/* Hero card */}
      <div className='rounded-xl border bg-card p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16 text-lg'>
              <AvatarImage src={primaryProfile?.avatar_url ?? undefined} />
              <AvatarFallback>
                {(lead.full_name ?? primaryProfile?.username ?? '??')
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-xl font-semibold'>
                {lead.full_name ?? `@${primaryProfile?.username}`}
              </h1>
              {lead.full_name && primaryProfile && (
                <p className='text-sm text-muted-foreground'>
                  @{primaryProfile.username}
                </p>
              )}
              <p className='mt-1 text-sm text-muted-foreground'>
                Captured {format(new Date(lead.captured_at), 'MMM d, yyyy')} via{' '}
                {capCfg?.label ?? lead.captured_from}
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setAddTagsOpen(true)}
          >
            <Tag className='mr-2 h-3.5 w-3.5' />
            Manage Tags
          </Button>
        </div>
      </div>

      {/* Social profiles — multi-platform section */}
      <div className='rounded-xl border bg-card p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-semibold'>
            Social Profiles
            <span className='ml-2 text-xs font-normal text-muted-foreground'>
              ({lead.social_profiles.length})
            </span>
          </h2>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setAddProfileOpen(true)}
          >
            <Plus className='mr-1.5 h-3.5 w-3.5' />
            Link Platform
          </Button>
        </div>

        <div className='space-y-3'>
          {lead.social_profiles.map(profile => {
            const platCfg = PLATFORM_CONFIG[profile.platform];
            return (
              <div
                key={profile.id}
                className='flex items-center justify-between rounded-lg border bg-background px-4 py-3'
              >
                <div className='flex items-center gap-3'>
                  <span className={cn('shrink-0', platCfg?.color)}>
                    {platCfg?.icon}
                  </span>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>
                        @{profile.username}
                      </span>
                      {profile.is_primary && (
                        <Badge
                          variant='secondary'
                          className='h-4 px-1.5 text-[10px]'
                        >
                          Primary
                        </Badge>
                      )}
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {platCfg?.label ?? profile.platform}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  {/* View on platform */}
                  {platCfg && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      asChild
                    >
                      <a
                        href={platCfg.profileUrl(profile.username)}
                        target='_blank'
                        rel='noopener noreferrer'
                        title='View profile'
                      >
                        <ExternalLink className='h-3.5 w-3.5' />
                      </a>
                    </Button>
                  )}
                  {/* Set primary */}
                  {!profile.is_primary && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7'
                      title='Set as primary'
                      disabled={settingPrimaryId === profile.id}
                      onClick={() => handleSetPrimary(profile)}
                    >
                      {settingPrimaryId === profile.id ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Star className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  )}
                  {/* Remove */}
                  {lead.social_profiles.length > 1 && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive/60 hover:text-destructive'
                      title='Unlink profile'
                      disabled={removingProfileId === profile.id}
                      onClick={() => handleRemoveProfile(profile)}
                    >
                      {removingProfileId === profile.id ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Trash2 className='h-3.5 w-3.5' />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-col info bar */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {/* Tags */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            <Tag className='h-3.5 w-3.5' />
            Tags
          </p>
          {lead.tags.length === 0 ? (
            <button
              onClick={() => setAddTagsOpen(true)}
              className='text-sm text-muted-foreground hover:text-foreground'
            >
              + Add tags
            </button>
          ) : (
            <div className='flex flex-wrap gap-1.5'>
              {lead.tags.map(tag => (
                <Badge
                  key={tag}
                  variant='outline'
                  className={cn('text-xs', getTagColor(tag))}
                >
                  {tag}
                </Badge>
              ))}
              <button
                onClick={() => setAddTagsOpen(true)}
                className='inline-flex items-center rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground'
              >
                + Edit
              </button>
            </div>
          )}
        </div>

        {/* Captured From */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            <Calendar className='h-3.5 w-3.5' />
            Captured From
          </p>
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-muted-foreground'>{capCfg?.icon}</span>
            <span>{capCfg?.label ?? lead.captured_from}</span>
            <Separator orientation='vertical' className='h-4' />
            <span className='text-muted-foreground'>
              {format(new Date(lead.captured_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Last Engaged */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            <Clock className='h-3.5 w-3.5' />
            Last Engaged
          </p>
          <p className='text-sm'>
            {lead.last_engaged ? (
              format(new Date(lead.last_engaged), 'MMM d, yyyy · h:mm a')
            ) : (
              <span className='text-muted-foreground'>No engagement yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Capture Context */}
      {lead.metadata &&
        (lead.metadata.post_url ||
          lead.metadata.keywords?.length ||
          lead.metadata.comment_id ||
          lead.metadata.engagement_type) && (
          <div className='rounded-xl border bg-card p-6'>
            <h2 className='mb-4 text-sm font-semibold'>Capture Context</h2>
            <div className='space-y-4'>
              {lead.metadata.post_url && (
                <div className='flex items-start gap-3'>
                  <ExternalLink className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <div>
                    <p className='mb-0.5 text-xs font-medium text-muted-foreground'>
                      Original Post URL
                    </p>
                    <a
                      href={lead.metadata.post_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='break-all text-sm text-primary hover:underline'
                    >
                      {lead.metadata.post_url}
                    </a>
                  </div>
                </div>
              )}
              {lead.metadata.keywords?.length ? (
                <div className='flex items-start gap-3'>
                  <Hash className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <div>
                    <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
                      Matched Keywords
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {lead.metadata.keywords.map(kw => (
                        <Badge
                          key={kw}
                          variant='secondary'
                          className='text-xs font-normal'
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              {lead.metadata.comment_id && (
                <div className='flex items-start gap-3'>
                  <MessageCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <div>
                    <p className='mb-0.5 text-xs font-medium text-muted-foreground'>
                      Comment ID
                    </p>
                    <p className='font-mono text-sm'>
                      {lead.metadata.comment_id}
                    </p>
                  </div>
                </div>
              )}
              {lead.metadata.engagement_type && (
                <div className='flex items-start gap-3'>
                  <Zap className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                  <div>
                    <p className='mb-1 text-xs font-medium text-muted-foreground'>
                      Engagement Type
                    </p>
                    <Badge variant='outline' className='capitalize'>
                      {lead.metadata.engagement_type}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Notes */}
      {lead.notes && (
        <div className='rounded-xl border bg-card p-6'>
          <h2 className='mb-3 text-sm font-semibold'>Notes</h2>
          <p className='text-sm text-muted-foreground'>{lead.notes}</p>
        </div>
      )}

      {/* Add Tags Sheet */}
      <AddTagsSheet
        open={addTagsOpen}
        onOpenChange={setAddTagsOpen}
        lead={lead}
        onSuccess={setLead}
      />

      {/* Link Social Profile Dialog */}
      <AddProfileDialog
        open={addProfileOpen}
        onOpenChange={setAddProfileOpen}
        leadId={lead.id}
        existingPlatforms={existingPlatforms}
        onSuccess={setLead}
      />
    </div>
  );
}
