import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMessageStore } from '../store/useMessageStore';
import { Send, Search, User, MessageSquare, CheckCheck, Clock, Loader2, Store, Users, Plus, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Messages() {
  const { user } = useAuthStore();
  const {
    messages,
    conversations,
    isLoading,
    currentConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    setCurrentConversation,
  } = useMessageStore();

  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.is_staff === true;
  const ADMIN_USER_ID = 1;

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
      scrollToBottom();
    }
  }, [currentConversation, fetchMessages]);

  useEffect(() => {
    const unreadMessages = messages.filter(
      msg => !msg.is_read && msg.receiver === user?.id
    );
    unreadMessages.forEach(msg => markAsRead(msg.message_id || msg.id));
  }, [messages, user?.id, markAsRead]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      let payload: any = { message: messageText.trim() };
      
      // IMPORTANT: Only add receiver if:
      // 1. Admin is replying to a specific customer (currentConversation exists)
      // 2. Or if it's a reply to an existing conversation
      if (currentConversation) {
        // Admin replying to customer OR customer replying to admin
        payload.receiver = currentConversation;
      }
      // If no currentConversation (new message), send WITHOUT receiver
      // This will go to all admins if sent by customer
      
      console.log('Sending payload:', payload);
      
      await sendMessage(payload.receiver, payload.message);
      setMessageText('');
      
      // If this was a new conversation (no currentConversation), refresh and select admin
      if (!currentConversation && !isAdmin) {
        await fetchConversations();
        // Find the admin conversation
        const adminConversation = conversations.find(c => c.user_id === ADMIN_USER_ID);
        if (adminConversation) {
          setCurrentConversation(ADMIN_USER_ID);
          await fetchMessages(ADMIN_USER_ID);
        }
        setShowNewMessage(false);
      }
      
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectConversation = async (userId: number) => {
    setCurrentConversation(userId);
    await fetchMessages(userId);
    setSearchTerm('');
    setShowNewMessage(false);
  };

  const handleStartNewMessage = () => {
    setShowNewMessage(true);
    setCurrentConversation(null);
    setMessageText('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipantName = (conversation: any) => {
    if (isAdmin) {
      return conversation.full_name;
    }
    return 'Melake Mihiret Support';
  };

  const isSendEnabled = messageText.trim().length > 0 && !isSending;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
      <div className="bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden h-full flex">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border/50 flex flex-col bg-gradient-to-b from-background to-muted/10">
          <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  {isAdmin ? 'Customer Messages' : 'Messages'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin 
                    ? 'Chat with your customers' 
                    : 'Chat with Melake Mihiret support'}
                </p>
              </div>
              {!isAdmin && (
                <button
                  onClick={handleStartNewMessage}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>

          {conversations.length > 0 && (
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={isAdmin ? "Search customers..." : "Search conversations..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 && !showNewMessage ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAdmin 
                    ? 'Customers will appear here when they message you' 
                    : 'Click the + button to start a conversation'}
                </p>
                {!isAdmin && (
                  <button
                    onClick={handleStartNewMessage}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-primary/90 transition-colors"
                  >
                    Start New Conversation
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {!showNewMessage && filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => handleSelectConversation(conv.user_id)}
                    className={`w-full p-4 flex items-center gap-3 transition-all duration-200 conversation-item ${
                      currentConversation === conv.user_id
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {isAdmin ? (
                          <Users className="w-6 h-6 text-primary" />
                        ) : (
                          <Store className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center glow-effect">
                          <span className="text-xs font-bold text-primary-foreground">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {getOtherParticipantName(conv)}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {formatMessageTime(conv.last_message_time)}
                      </p>
                      {conv.unread_count > 0 && (
                        <div className="mt-1 w-2 h-2 bg-primary rounded-full mx-auto"></div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/5">
          {currentConversation || showNewMessage ? (
            <>
              <div className="p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {isAdmin ? (
                      <Users className="w-5 h-5 text-primary" />
                    ) : (
                      <Store className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {currentConversation 
                        ? (isAdmin 
                            ? conversations.find(c => c.user_id === currentConversation)?.full_name || 'Customer'
                            : 'Melake Mihiret Support')
                        : 'New Message'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {currentConversation 
                        ? (isAdmin ? 'Customer' : 'Usually replies within hours')
                        : 'Send a message to our support team'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && !showNewMessage ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => {
                      const isOwnMessage = msg.sender === user?.id;
                      return (
                        <motion.div
                          key={msg.message_id || msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl p-3 message-bubble ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted text-foreground rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.message}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${
                              isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>{formatMessageTime(msg.created_at)}</span>
                              {isOwnMessage && (
                                msg.is_read ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3 opacity-60" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-6 border-t border-border/50 bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    disabled={isSending}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!isSendEnabled}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isSendEnabled
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 cursor-pointer'
                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6 float-animation">
                <MessageSquare className="w-12 h-12 text-primary/60" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                {isAdmin ? 'Select a Customer' : 'Welcome to Messages'}
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                {isAdmin 
                  ? 'Select a customer from the sidebar to start chatting' 
                  : 'Click the + button to start a conversation with our support team'}
              </p>
              {!isAdmin && (
                <button
                  onClick={handleStartNewMessage}
                  className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Start New Conversation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
