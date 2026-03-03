'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConversationList } from '@/components/conversations/conversation-list';
import { MessageThread } from '@/components/conversations/message-thread';
import { Conversation, Message } from '@/lib/types/conversations';
import { conversationsApi } from '@/lib/api/conversations';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

export default function ConversationsPage() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >();
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter] = useState<'all' | 'unread' | 'archived'>('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await conversationsApi.list({
        search: debouncedSearchQuery,
        unread_only: filter === 'unread',
        limit: 100,
      });

      if (response?.data && Array.isArray(response.data)) {
        setConversations(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load conversations',
      });
    } finally {
      setIsLoadingList(false);
    }
  }, [debouncedSearchQuery, filter, toast]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      setMessages([]);
      try {
        const response = await conversationsApi.getMessages(
          conversationId,
          1,
          100
        );
        if (response?.data && Array.isArray(response.data)) {
          setMessages(response.data);
          // Mark conversation as read
          await conversationsApi.markAsRead(conversationId);
        }
      } catch (_error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load messages',
        });
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [toast]
  );

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    setIsSending(true);
    try {
      const newMessage = await conversationsApi.sendMessage(
        selectedConversationId,
        {
          content,
          message_type: 'text',
        }
      );

      if (newMessage.data) {
        setMessages(prev => [...prev, newMessage.data]);
        toast({
          title: 'Success',
          description: 'Message sent',
        });
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleArchive = async () => {
    if (!selectedConversationId) return;

    try {
      await conversationsApi.archive(selectedConversationId);
      setConversations(prev =>
        prev.filter(c => c.id !== selectedConversationId)
      );
      setSelectedConversationId(undefined);
      setMessages([]);
      toast({
        title: 'Success',
        description: 'Conversation archived',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to archive conversation',
      });
    }
  };

  const handleClose = async () => {
    if (!selectedConversationId) return;

    try {
      await conversationsApi.close(selectedConversationId);
      setConversations(prev =>
        prev.filter(c => c.id !== selectedConversationId)
      );
      setSelectedConversationId(undefined);
      setMessages([]);
      toast({
        title: 'Success',
        description: 'Conversation closed',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to close conversation',
      });
    }
  };

  const selectedConversation = conversations.find(
    c => c.id === selectedConversationId
  );

  return (
    <div className='flex h-screen bg-background'>
      {/* Left Panel: Conversation List */}
      <div className='w-1/3 border-r border-border flex flex-col'>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
          onSearch={handleSearch}
          isLoading={isLoadingList}
          filter={filter}
        />
      </div>

      {/* Right Panel: Message Thread */}
      <div className='flex-1 flex flex-col'>
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            messages={messages}
            currentUserId='current-user-id' // This should come from auth context
            onSendMessage={handleSendMessage}
            onArchive={handleArchive}
            onClose={handleClose}
            isLoading={isSending || isLoadingMessages}
          />
        ) : (
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <p className='text-lg font-semibold mb-2'>
                No conversation selected
              </p>
              <p className='text-sm text-muted-foreground'>
                Select a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
