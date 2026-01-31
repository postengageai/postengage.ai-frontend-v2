'use client';

import React, { useEffect } from 'react';
import { InboxLayout } from '@/components/inbox/inbox-layout';
import { ConversationList } from '@/components/inbox/conversation-list';
import { ChatWindow } from '@/components/inbox/chat-window';
import { LeadSidebar } from '@/components/inbox/lead-sidebar';
import { useInboxActions, useInboxFilters } from '@/lib/inbox/store';
import { inboxApi } from '@/lib/api/inbox';

export default function InboxPage() {
  const { setConversations, setLoadingConversations } = useInboxActions();
  const filters = useInboxFilters();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const response = await inboxApi.getConversations(filters);
        setConversations(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [filters, setConversations, setLoadingConversations]);

  return (
    <InboxLayout>
      <ConversationList />
      <ChatWindow />
      <LeadSidebar />
    </InboxLayout>
  );
}
