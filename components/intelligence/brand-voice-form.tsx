'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  BrandVoice,
  CreateBrandVoiceDto,
  ResponseLengthPreference,
} from '@/lib/types/intelligence';

const brandVoiceFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  tone_primary: z.string().min(1, 'Tone is required'),
  tone_intensity: z.number().min(1).max(10),
  formality: z.string().min(1, 'Formality is required'),
  language: z.string().default('en'),
  keywords_to_include: z.string().optional(),
  keywords_to_avoid: z.string().optional(),
  preferred_greetings: z.string().optional(),
  preferred_closings: z.string().optional(),
  response_length: z.nativeEnum(ResponseLengthPreference),
  use_emojis: z.boolean().default(true),
  emoji_intensity: z.number().min(1).max(5),
  use_hashtags: z.boolean().default(false),
  company_name: z.string().optional(),
  company_description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  operating_hours: z.string().optional(),
  custom_instructions: z.string().optional(),
});

type BrandVoiceFormValues = z.infer<typeof brandVoiceFormSchema>;

interface BrandVoiceFormProps {
  initialData?: BrandVoice;
}

export function BrandVoiceForm({ initialData }: BrandVoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<BrandVoiceFormValues> = initialData
    ? {
        name: initialData.name,
        description: initialData.description,
        tone_primary: initialData.tone_primary,
        tone_intensity: initialData.tone_intensity,
        formality: initialData.formality,
        language: initialData.language,
        keywords_to_include: initialData.keywords_to_include.join(', '),
        keywords_to_avoid: initialData.keywords_to_avoid.join(', '),
        preferred_greetings: initialData.preferred_greetings.join(', '),
        preferred_closings: initialData.preferred_closings.join(', '),
        response_length: initialData.response_length,
        use_emojis: initialData.use_emojis,
        emoji_intensity: initialData.emoji_intensity,
        use_hashtags: initialData.use_hashtags,
        company_name: initialData.company_name,
        company_description: initialData.company_description,
        website: initialData.website,
        contact_email: initialData.contact_email,
        operating_hours: initialData.operating_hours,
        custom_instructions: initialData.custom_instructions,
      }
    : {
        name: '',
        description: '',
        tone_primary: 'friendly',
        tone_intensity: 6,
        formality: 'casual',
        language: 'en',
        keywords_to_include: '',
        keywords_to_avoid: '',
        preferred_greetings: 'Hey!, Hi there!',
        preferred_closings: '',
        response_length: ResponseLengthPreference.MEDIUM,
        use_emojis: true,
        emoji_intensity: 2,
        use_hashtags: false,
        company_name: '',
        company_description: '',
        website: '',
        contact_email: '',
        operating_hours: '',
        custom_instructions: '',
      };

  const form = useForm<BrandVoiceFormValues>({
    resolver: zodResolver(brandVoiceFormSchema),
    defaultValues,
  });

  async function onSubmit(data: BrandVoiceFormValues) {
    setIsLoading(true);
    try {
      const formattedData: CreateBrandVoiceDto = {
        ...data,
        keywords_to_include: data.keywords_to_include
          ? data.keywords_to_include
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        keywords_to_avoid: data.keywords_to_avoid
          ? data.keywords_to_avoid
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        preferred_greetings: data.preferred_greetings
          ? data.preferred_greetings
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
        preferred_closings: data.preferred_closings
          ? data.preferred_closings
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
      };

      if (initialData) {
        await IntelligenceApi.updateBrandVoice(initialData._id, formattedData);
        toast({
          title: 'Brand Voice updated',
          description: 'Your brand voice has been updated successfully.',
        });
      } else {
        await IntelligenceApi.createBrandVoice(formattedData);
        toast({
          title: 'Brand Voice created',
          description: 'Your new brand voice has been created successfully.',
        });
        router.push('/dashboard/intelligence/brand-voices');
      }
      router.refresh();
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Main Content (Left Column) */}
          <div className='lg:col-span-2 space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Define the core identity of your brand voice.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Professional Support'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Brief description of this persona...'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Identity</CardTitle>
                <CardDescription>
                  Briefly describe your business for context. Use Knowledge
                  Sources for detailed products/services.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='company_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Acme Corp' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='company_description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Company (Elevator Pitch)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='We provide high-quality widgets for enterprise clients. (Keep it brief - use Knowledge Base for full details)'
                          className='min-h-[100px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='website'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder='https://example.com' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='contact_email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder='support@example.com' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vocabulary & Keywords</CardTitle>
                <CardDescription>
                  Control specific words and phrases.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='keywords_to_include'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords to Include</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Comma separated (e.g. awesome, great, thanks)'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='keywords_to_avoid'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords to Avoid</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Comma separated (e.g. sorry, unfortunately)'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='preferred_greetings'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Greetings</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. Hi, Hello there'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='preferred_closings'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closings</FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Best, Cheers' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Instructions</CardTitle>
                <CardDescription>
                  Specific behavioral rules (e.g., "Never apologize", "Always be
                  enthusiastic").
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='custom_instructions'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Behavioral Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='e.g. Always be polite, never use slang. Do not include factual data here.'
                          className='min-h-[150px]'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Right Column) */}
          <div className='space-y-8'>
            <Card>
              <CardHeader>
                <CardTitle>Tone & Style</CardTitle>
                <CardDescription>How should the AI sound?</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='tone_primary'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select tone' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='friendly'>Friendly</SelectItem>
                          <SelectItem value='professional'>
                            Professional
                          </SelectItem>
                          <SelectItem value='empathetic'>Empathetic</SelectItem>
                          <SelectItem value='witty'>Witty</SelectItem>
                          <SelectItem value='urgent'>Urgent</SelectItem>
                          <SelectItem value='authoritative'>
                            Authoritative
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='formality'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formality</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select formality' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='casual'>Casual</SelectItem>
                          <SelectItem value='neutral'>Neutral</SelectItem>
                          <SelectItem value='formal'>Formal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='tone_intensity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone Intensity ({field.value})</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={vals => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        1 = Subtle, 10 = Very Strong
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='response_length'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Length</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select length' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ResponseLengthPreference.SHORT}>
                            Short (Concise)
                          </SelectItem>
                          <SelectItem value={ResponseLengthPreference.MEDIUM}>
                            Medium (Balanced)
                          </SelectItem>
                          <SelectItem value={ResponseLengthPreference.LONG}>
                            Long (Detailed)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='use_emojis'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>Use Emojis</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('use_emojis') && (
                  <FormField
                    control={form.control}
                    name='emoji_intensity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emoji Intensity ({field.value})</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={vals => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name='use_hashtags'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Use Hashtags
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className='sticky top-6'>
              <div className='flex flex-col gap-4'>
                <Button
                  type='submit'
                  size='lg'
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {initialData ? 'Update Brand Voice' : 'Create Brand Voice'}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='lg'
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className='w-full'
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
