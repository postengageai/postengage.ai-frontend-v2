import Image from 'next/image';
import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  SendDmMediaMessage,
  SendDmTextMessage,
  SendDmPayload,
} from '@/lib/api/automations';

interface InstagramDmActionProps {
  payload: SendDmPayload;
  onUpdate: (updates: Partial<SendDmPayload>) => void;
}

export function InstagramDmAction({
  payload,
  onUpdate,
}: InstagramDmActionProps) {
  // Determine if we are in text or media mode based on the message type
  const messageType =
    payload.message?.type === 'text' || !payload.message ? 'text' : 'media';

  const handleTypeChange = (val: string) => {
    if (val === 'text') {
      // Switch to text payload
      const textPayload: SendDmPayload = {
        ...payload,
        attachment_id: undefined,
        message: {
          type: 'text',
          text:
            payload.message?.type === 'text'
              ? (payload.message as SendDmTextMessage).text
              : '',
        },
      };
      onUpdate(textPayload);
    } else {
      // Switch to media payload
      // Preserve existing media if switching back, or default to image
      const currentMessage =
        payload.message?.type !== 'text'
          ? (payload.message as SendDmMediaMessage)
          : null;

      const type =
        currentMessage?.type &&
        ['image', 'video', 'file'].includes(currentMessage.type)
          ? currentMessage.type
          : 'image';

      const mediaPayload: SendDmPayload = {
        ...payload,
        use_ai_reply: false, // Ensure AI reply is disabled for media
        message: {
          type: type,
          payload: {
            url: currentMessage?.payload?.url || '',
            is_reusable: true,
          },
        },
      };
      onUpdate(mediaPayload);
    }
  };

  return (
    <Tabs
      value={messageType}
      onValueChange={handleTypeChange}
      className='w-full'
    >
      <TabsList className='mb-4 grid w-full grid-cols-2'>
        <TabsTrigger value='text'>Text Message</TabsTrigger>
        <TabsTrigger value='media'>Media Message</TabsTrigger>
      </TabsList>

      <TabsContent value='text' className='mt-0'>
        <DmTextPanel payload={payload} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value='media' className='mt-0'>
        <DmMediaPanel payload={payload} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  );
}

// Subcomponent for Text Panel
function DmTextPanel({
  payload,
  onUpdate,
}: {
  payload: SendDmPayload;
  onUpdate: (updates: Partial<SendDmPayload>) => void;
}) {
  const switchId = useId();
  // Safe access to text property
  const textValue =
    payload.message?.type === 'text' ? payload.message.text : '';

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          {payload.use_ai_reply ? 'Fallback Message' : 'Message Content'}
        </Label>
        <div className='flex items-center space-x-2'>
          <Label
            htmlFor={switchId}
            className='cursor-pointer text-xs text-muted-foreground'
          >
            Auto-generate with AI
          </Label>
          <Switch
            id={switchId}
            checked={payload.use_ai_reply || false}
            onCheckedChange={checked =>
              onUpdate({
                ...payload,
                use_ai_reply: checked,
              })
            }
          />
        </div>
      </div>

      {payload.use_ai_reply && (
        <div className='relative mb-4 overflow-hidden rounded-lg border border-primary/20 bg-primary/5 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
              <Sparkles className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-foreground'>
                AI Reply Active
              </h3>
              <p className='text-xs text-muted-foreground'>
                AI will generate the response.
              </p>
            </div>
          </div>
        </div>
      )}

      <Textarea
        placeholder={
          payload.use_ai_reply
            ? 'Enter a fallback message in case AI fails...'
            : 'Enter DM message...'
        }
        value={textValue}
        onChange={e =>
          onUpdate({
            ...payload,
            message: {
              type: 'text',
              text: e.target.value,
            },
          })
        }
        rows={5}
        className='resize-none'
      />
      {payload.use_ai_reply && (
        <p className='text-xs text-muted-foreground'>
          This message will be sent if the AI cannot generate a response.
        </p>
      )}
    </div>
  );
}

// Subcomponent for Media Panel
function DmMediaPanel({
  payload,
  onUpdate,
}: {
  payload: SendDmPayload;
  onUpdate: (updates: Partial<SendDmPayload>) => void;
}) {
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Safe access to media message
  const mediaMessage =
    payload.message?.type !== 'text' ? payload.message : null;

  const handleMediaSelect = (media: {
    url: string;
    mime_type: string;
    size?: number;
  }) => {
    // Validate size
    let limit = 25 * 1024 * 1024;
    let limitLabel = '25MB';
    if (media.mime_type.startsWith('image/')) {
      limit = 8 * 1024 * 1024;
      limitLabel = '8MB';
    }

    if (media.size && media.size > limit) {
      toast({
        variant: 'destructive',
        title: 'Media too large',
        description: `Selected media exceeds Instagram limit of ${limitLabel}.`,
      });
      return;
    }

    // Determine type based on mime_type
    let type: 'image' | 'video' | 'file' = 'file';
    if (media.mime_type.startsWith('image/')) type = 'image';
    else if (media.mime_type.startsWith('video/')) type = 'video';

    onUpdate({
      ...payload,
      message: {
        type: type,
        payload: {
          url: media.url,
          is_reusable: true,
        },
      },
    });
  };

  const handleRemoveAttachment = () => {
    onUpdate({
      ...payload,
      attachment_id: undefined,
      message: {
        type: 'image', // default reset
        payload: {
          url: '',
          is_reusable: true,
        },
      },
    });
  };

  return (
    <div className='space-y-4 rounded-md border border-border bg-muted/30 p-4'>
      <Label className='block text-sm font-medium'>Attachment</Label>
      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='sm:col-span-3'>
          {mediaMessage?.payload?.url ? (
            <div className='relative mt-2 overflow-hidden rounded-md border border-border bg-background'>
              {mediaMessage.type === 'image' && (
                <div className='relative h-48 w-full'>
                  <Image
                    src={mediaMessage.payload.url}
                    alt='Attachment preview'
                    fill
                    className='object-cover'
                    unoptimized
                  />
                </div>
              )}
              {mediaMessage.type === 'video' && (
                <video
                  src={mediaMessage.payload.url}
                  className='h-48 w-full bg-black'
                  controls
                />
              )}
              {(!mediaMessage.type || mediaMessage.type === 'file') && (
                <div className='flex h-48 flex-col items-center justify-center gap-3 bg-muted/30 p-4 transition-colors hover:bg-muted/50'>
                  <div className='rounded-full bg-primary/10 p-4'>
                    <FileText className='h-8 w-8 text-primary' />
                  </div>
                  <div className='px-4 text-center'>
                    <p className='line-clamp-2 text-sm font-medium'>
                      Attached File
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={handleRemoveAttachment}
                className='absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70'
                title='Remove attachment'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          ) : (
            <Button
              variant='outline'
              type='button'
              className='mt-2 h-auto w-full flex-col gap-2 border-dashed py-8 hover:border-primary hover:bg-primary/5'
              onClick={() => setPickerOpen(true)}
            >
              <div className='rounded-full bg-muted p-3 group-hover:bg-primary/10'>
                <ImageIcon className='h-6 w-6 text-muted-foreground group-hover:text-primary' />
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-sm font-medium'>Select Attachment</span>
                <span className='text-xs text-muted-foreground'>
                  Image or Video
                </span>
              </div>
            </Button>
          )}
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
