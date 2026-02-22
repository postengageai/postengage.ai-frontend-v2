import { describe, expect, it } from 'vitest';
import { brandVoiceFormSchema } from '../brand-voice-form';
import { ResponseLengthPreference } from '@/lib/types/intelligence';

describe('brandVoiceFormSchema', () => {
  it('requires name and tone_primary', () => {
    const result = brandVoiceFormSchema.safeParse({
      name: '',
      description: '',
      tone_primary: '',
      tone_intensity: 5,
      formality: '',
      language: 'en',
      keywords_to_include: '',
      keywords_to_avoid: '',
      preferred_greetings: '',
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
    });

    expect(result.success).toBe(false);
  });

  it('validates website and contact_email formats when provided', () => {
    const result = brandVoiceFormSchema.safeParse({
      name: 'Test Voice',
      description: '',
      tone_primary: 'friendly',
      tone_intensity: 5,
      formality: 'casual',
      language: 'en',
      keywords_to_include: '',
      keywords_to_avoid: '',
      preferred_greetings: '',
      preferred_closings: '',
      response_length: ResponseLengthPreference.MEDIUM,
      use_emojis: true,
      emoji_intensity: 2,
      use_hashtags: false,
      company_name: '',
      company_description: '',
      website: 'not-a-url',
      contact_email: 'not-an-email',
      operating_hours: '',
      custom_instructions: '',
    });

    expect(result.success).toBe(false);
  });
});
