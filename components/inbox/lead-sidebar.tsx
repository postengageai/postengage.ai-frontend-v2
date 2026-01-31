import React, { useState } from 'react';
import {
  useSelectedConversationId,
  useInboxConversations,
  useInboxActions,
} from '@/lib/inbox/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ExternalLink,
  Mail,
  Phone,
  Tag,
  Edit2,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { inboxApi } from '@/lib/api/inbox';
import { toast } from 'sonner';

export function LeadSidebar() {
  const selectedId = useSelectedConversationId();
  const conversations = useInboxConversations();
  const { updateConversation } = useInboxActions();

  const conversation = conversations.find(c => c._id === selectedId);

  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Sync state when conversation changes or editing starts
  React.useEffect(() => {
    if (conversation?.lead) {
      setNotes(conversation.lead.notes || '');
      setTags(conversation.lead.tags || []);
    }
  }, [conversation?.lead, isEditing]);

  const handleSave = async () => {
    if (!conversation?.lead || !selectedId) return;

    const originalLead = conversation.lead;

    // Optimistic update
    updateConversation(selectedId, {
      lead: {
        ...originalLead,
        notes,
        tags,
      },
    });

    setIsEditing(false);

    try {
      await inboxApi.updateLead(conversation.lead._id, { notes, tags });
      toast.success('Lead updated successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
      // Revert on failure
      updateConversation(selectedId, { lead: originalLead });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!conversation || !conversation.lead) {
    return (
      <div className='w-80 border-l p-6 text-center text-muted-foreground bg-background'>
        Select a conversation to view lead details
      </div>
    );
  }

  const { lead } = conversation;

  return (
    <div className='w-80 border-l bg-background flex flex-col h-full overflow-y-auto'>
      <div className='p-6 flex flex-col items-center border-b relative'>
        {/* Edit Toggle */}
        <div className='absolute top-4 right-4'>
          {isEditing ? (
            <div className='flex gap-2'>
              <Button
                size='icon'
                variant='ghost'
                onClick={() => setIsEditing(false)}
              >
                <X className='h-4 w-4' />
              </Button>
              <Button size='icon' variant='default' onClick={handleSave}>
                <Save className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <Button
              size='icon'
              variant='ghost'
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className='h-4 w-4' />
            </Button>
          )}
        </div>

        <Avatar className='h-24 w-24 mb-4'>
          <AvatarImage src={lead.profile_picture} />
          <AvatarFallback className='text-xl'>
            {lead.full_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <h2 className='text-xl font-bold text-center'>{lead.full_name}</h2>
        <p className='text-muted-foreground text-sm'>@{lead.username}</p>

        <div className='flex gap-2 mt-4'>
          <Button variant='outline' size='sm'>
            <ExternalLink className='h-4 w-4 mr-2' />
            Profile
          </Button>
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Contact Info */}
        <div>
          <h3 className='font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wider'>
            Contact Info
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center gap-3 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span>{/* lead.email || */ 'No email'}</span>
            </div>
            <div className='flex items-center gap-3 text-sm'>
              <Phone className='h-4 w-4 text-muted-foreground' />
              <span>{/* lead.phone || */ 'No phone'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div>
          <h3 className='font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wider'>
            Tags
          </h3>

          {isEditing ? (
            <div className='space-y-3'>
              <div className='flex gap-2'>
                <Input
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  placeholder='Add tag...'
                  className='h-8 text-sm'
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                />
                <Button size='sm' variant='ghost' onClick={handleAddTag}>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant='secondary'
                    className='flex items-center gap-1 pr-1'
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className='hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {lead.tags && lead.tags.length > 0 ? (
                lead.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant='secondary'
                    className='flex items-center gap-1'
                  >
                    <Tag className='h-3 w-3' />
                    {tag}
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground italic'>No tags</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Notes */}
        <div>
          <h3 className='font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wider'>
            Notes
          </h3>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder='Add notes about this lead...'
              className='min-h-[100px] text-sm'
            />
          ) : (
            <div className='bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap'>
              {lead.notes || (
                <span className='text-muted-foreground italic'>
                  No notes available
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
