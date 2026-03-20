'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { useUserStore } from '@/lib/user/store';

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const IS_DEV = process.env.NODE_ENV === 'development';

export function MicrosoftClarity() {
  const user = useUserStore(state => state.user);

  // Initialise Clarity once on mount
  useEffect(() => {
    if (CLARITY_PROJECT_ID) {
      Clarity.init(CLARITY_PROJECT_ID);
    } else if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Clarity] Project ID is missing. Set NEXT_PUBLIC_CLARITY_PROJECT_ID in your .env file.'
      );
    }
  }, []);

  // Identify the user whenever Clarity is ready and a user is in the store.
  // This handles both:
  //   • Fresh login  (user gets set → effect fires)
  //   • Session restore on page reload (user already in store when component mounts)
  useEffect(() => {
    if (!CLARITY_PROJECT_ID || !user) return;
    try {
      const friendlyName =
        user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : user.email;
      Clarity.identify(user.id, undefined, undefined, friendlyName);
      Clarity.setTag('email', user.email);
    } catch {
      // Clarity initialisation may still be in progress — safe to swallow
    }
  }, [user]);

  return null;
}
