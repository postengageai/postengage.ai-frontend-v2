import { describe, expect, it } from 'vitest';
import { botFormSchema } from '../bot-form';

describe('botFormSchema', () => {
  it('requires name and social_account_id', () => {
    const result = botFormSchema.safeParse({
      name: '',
      description: '',
      social_account_id: '',
      behavior: {
        auto_reply_enabled: true,
        max_replies_per_hour: 3,
        max_replies_per_day: 10,
        reply_delay_min_seconds: 30,
        reply_delay_max_seconds: 300,
        escalation_threshold: 0.7,
        cta_aggressiveness: 'soft',
        should_reply_to_spam: false,
        stop_after_escalation: true,
      },
    });

    expect(result.success).toBe(false);
  });

  it('enforces reply_delay_max_seconds greater than or equal to min', () => {
    const result = botFormSchema.safeParse({
      name: 'Test Bot',
      description: '',
      social_account_id: 'account-1',
      behavior: {
        auto_reply_enabled: true,
        max_replies_per_hour: 3,
        max_replies_per_day: 10,
        reply_delay_min_seconds: 100,
        reply_delay_max_seconds: 50,
        escalation_threshold: 0.7,
        cta_aggressiveness: 'soft',
        should_reply_to_spam: false,
        stop_after_escalation: true,
      },
    });

    expect(result.success).toBe(false);
  });
});
