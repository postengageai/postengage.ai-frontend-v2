import { create } from 'zustand';
import React from 'react';
import {
  InboxConversation,
  InboxMessage,
  InboxConversationFilters,
  InboxConversationStatus,
} from '../types/inbox';

interface InboxState {
  conversations: InboxConversation[];
  selectedConversationId: string | null;
  messages: Record<string, InboxMessage[]>; // Map conversationId to messages
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  filters: InboxConversationFilters;

  actions: {
    setConversations: (conversations: InboxConversation[]) => void;
    addConversation: (conversation: InboxConversation) => void;
    updateConversation: (
      id: string,
      updates: Partial<InboxConversation>
    ) => void;

    selectConversation: (id: string | null) => void;

    setMessages: (conversationId: string, messages: InboxMessage[]) => void;
    addMessage: (conversationId: string, message: InboxMessage) => void;
    updateMessage: (
      conversationId: string,
      messageId: string,
      updates: Partial<InboxMessage>
    ) => void;

    setLoadingConversations: (isLoading: boolean) => void;
    setLoadingMessages: (isLoading: boolean) => void;

    setFilters: (filters: InboxConversationFilters) => void;
  };
}

export const useInboxStore = create<InboxState>(set => ({
  conversations: [],
  selectedConversationId: null,
  messages: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  filters: { status: InboxConversationStatus.ALL }, // default filter

  actions: {
    setConversations: conversations => set({ conversations }),
    addConversation: conversation =>
      set(state => ({ conversations: [conversation, ...state.conversations] })),
    updateConversation: (id, updates) =>
      set(state => ({
        conversations: state.conversations.map(c =>
          c._id === id ? { ...c, ...updates } : c
        ),
      })),

    selectConversation: id => set({ selectedConversationId: id }),

    setMessages: (conversationId, messages) =>
      set(state => ({
        messages: { ...state.messages, [conversationId]: messages },
      })),
    addMessage: (conversationId, message) =>
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
        },
      })),
    updateMessage: (
      conversationId: string,
      messageId: string,
      updates: Partial<InboxMessage>
    ) =>
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map(msg =>
            msg._id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      })),

    setLoadingConversations: isLoading =>
      set({ isLoadingConversations: isLoading }),
    setLoadingMessages: isLoading => set({ isLoadingMessages: isLoading }),

    setFilters: filters => set({ filters }),
  },
}));

export const useInboxConversations = () =>
  useInboxStore(state => state.conversations);
export const useSelectedConversationId = () =>
  useInboxStore(state => state.selectedConversationId);
const EMPTY_MESSAGES: InboxMessage[] = [];

export const useInboxMessages = (conversationId: string | null) => {
  const selector = React.useCallback(
    (state: InboxState) =>
      conversationId
        ? state.messages[conversationId] || EMPTY_MESSAGES
        : EMPTY_MESSAGES,
    [conversationId]
  );
  return useInboxStore(selector);
};
export const useInboxLoading = () =>
  useInboxStore(state => ({
    conversations: state.isLoadingConversations,
    messages: state.isLoadingMessages,
  }));
export const useInboxFilters = () => useInboxStore(state => state.filters);
export const useInboxActions = () => useInboxStore(state => state.actions);
