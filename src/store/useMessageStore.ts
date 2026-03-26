import { create } from 'zustand';
import { Message, Conversation } from '../types';
import { apiClient } from '../api/client';

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  isLoading: boolean;
  currentConversation: number | null;
  fetchMessages: (userId: number) => Promise<void>;
  fetchConversations: () => Promise<void>;
  sendMessage: (receiverId: number, message: string) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
  setCurrentConversation: (userId: number | null) => void;
}

// Get the admin user ID - you can set this in your backend or .env
// For now, let's assume admin user ID is 1 (you can change this)
const ADMIN_USER_ID = 1;

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  conversations: [],
  isLoading: false,
  currentConversation: null,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await apiClient.get('messages/');
      const allMessages = response.data?.results || response.data || [];
      
      // Get current user from localStorage
      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const isAdmin = currentUser?.is_staff === true;
      
      // Group messages by conversation
      const conversationMap = new Map<number, Conversation>();
      
      allMessages.forEach((msg: Message) => {
        // Determine the other participant
        const otherUserId = msg.sender === currentUser?.id ? msg.receiver : msg.sender;
        
        // For admin: show all conversations with different users
        // For customers: only show conversation with admin
        if (!isAdmin && otherUserId !== ADMIN_USER_ID) {
          return; // Skip non-admin conversations for customers
        }
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user_id: otherUserId,
            username: msg.sender_name || `User ${otherUserId}`,
            full_name: msg.sender_name || `User ${otherUserId}`,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: !msg.is_read && msg.receiver === currentUser?.id ? 1 : 0,
          });
        } else {
          const existing = conversationMap.get(otherUserId)!;
          if (new Date(msg.created_at) > new Date(existing.last_message_time)) {
            existing.last_message = msg.message;
            existing.last_message_time = msg.created_at;
          }
          if (!msg.is_read && msg.receiver === currentUser?.id) {
            existing.unread_count++;
          }
        }
      });
      
      const conversations = Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );
      
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoading: false });
    }
  },

  fetchMessages: async (userId: number) => {
    set({ isLoading: true, currentConversation: userId });
    try {
      const response = await apiClient.get('messages/');
      const allMessages = response.data?.results || response.data || [];
      
      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      // Filter messages between current user and selected user
      const filteredMessages = allMessages.filter(
        (msg: Message) =>
          (msg.sender === currentUser?.id && msg.receiver === userId) ||
          (msg.sender === userId && msg.receiver === currentUser?.id)
      );
      
      set({ messages: filteredMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ), isLoading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId: number, message: string) => {
    try {
      const response = await apiClient.post('messages/', {
        receiver: receiverId,
        message: message,
      });
      
      const newMessage = response.data;
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
      
      // Refresh conversations
      await get().fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markAsRead: async (messageId: number) => {
    try {
      await apiClient.post(`messages/${messageId}/mark_read/`);
      set((state) => ({
        messages: state.messages.map(msg =>
          msg.message_id === messageId ? { ...msg, is_read: true } : msg
        ),
      }));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  setCurrentConversation: (userId: number | null) => {
    set({ currentConversation: userId });
  },
}));