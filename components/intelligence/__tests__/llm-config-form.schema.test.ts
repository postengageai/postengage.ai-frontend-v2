import { describe, expect, it } from 'vitest';
import { createLlmConfigSchema } from '../llm-config-form';
import {
  ByomProvider,
  LlmConfigMode,
  ResponseLengthPreference,
} from '@/lib/types/intelligence';

describe('createLlmConfigSchema', () => {
  it('requires api_key in BYOM mode when no masked key exists', () => {
    const schema = createLlmConfigSchema(false);

    const result = schema.safeParse({
      mode: LlmConfigMode.BYOM,
      byom_config: {
        provider: ByomProvider.OPENAI,
        api_key: '',
        preferred_model: 'gpt-4o',
        fallback_model: 'gpt-3.5-turbo',
        max_tokens_per_request: 500,
        monthly_token_budget: 1000000,
      },
      settings: {
        temperature: 1,
        max_response_length: ResponseLengthPreference.MEDIUM,
        language: 'en',
      },
    });

    expect(result.success).toBe(false);
  });

  it('allows empty api_key in BYOM mode when masked key exists', () => {
    const schema = createLlmConfigSchema(true);

    const result = schema.safeParse({
      mode: LlmConfigMode.BYOM,
      byom_config: {
        provider: ByomProvider.OPENAI,
        api_key: '',
        preferred_model: 'gpt-4o',
        fallback_model: 'gpt-3.5-turbo',
        max_tokens_per_request: 500,
        monthly_token_budget: 1000000,
      },
      settings: {
        temperature: 1,
        max_response_length: ResponseLengthPreference.MEDIUM,
        language: 'en',
      },
    });

    expect(result.success).toBe(true);
  });
});
