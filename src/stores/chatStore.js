import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const createWelcomeMessage = () => ({
  id: typeof window !== 'undefined' && crypto?.randomUUID ? crypto.randomUUID() : `welcome-${Date.now()}`,
  text: "Hey there! I'm Ozzie, your AI-powered Opportunity Zone expert. I can help you understand OZ investments, tax benefits, market trends, and find the best opportunities for your portfolio. What would you like to explore today?",
  sender: 'bot'
});

export const useChatStore = create(
  devtools(
    persist(
      (set, get) => ({
      // Current active user ID
      currentUserId: 'guest',
      
      // All conversations keyed by user ID
      conversations: {
        guest: {
          messages: [createWelcomeMessage()],
          messageCount: 0
        }
      },
      
      // Get current conversation
      getCurrentConversation: () => {
        const { conversations, currentUserId } = get();
        return conversations[currentUserId] || {
          messages: [createWelcomeMessage()],
          messageCount: 0
        };
      },
      
             // Add message to current conversation
       addMessage: (message) => set((state) => {
         const messageWithId = {
           ...message,
           id: message.id || (crypto?.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`)
         };
         
         const updatedConversations = {
           ...state.conversations,
           [state.currentUserId]: {
             ...state.conversations[state.currentUserId],
             messages: [...(state.conversations[state.currentUserId]?.messages || []), messageWithId]
           }
         };
         
         return { conversations: updatedConversations };
       }, false, 'addMessage'),
      
      // Increment message count for current user
      incrementMessageCount: () => set((state) => ({
        conversations: {
          ...state.conversations,
          [state.currentUserId]: {
            ...state.conversations[state.currentUserId],
            messageCount: (state.conversations[state.currentUserId]?.messageCount || 0) + 1
          }
        }
      }), false, 'incrementMessageCount'),
      
      // Switch to different user (for auth state changes)
      setCurrentUser: (userId) => set((state) => {
        // Ensure the user has a conversation initialized
        if (!state.conversations[userId]) {
          return {
            currentUserId: userId,
                          conversations: {
                ...state.conversations,
                [userId]: {
                  messages: [createWelcomeMessage()],
                  messageCount: 0
                }
              }
          };
        }
        
        return { currentUserId: userId };
      }, false, 'setCurrentUser'),
      
      // Copy guest conversation to authenticated user
      copyGuestToUser: (userId) => set((state) => {
        const guestConversation = state.conversations.guest;
        
        if (!guestConversation || !userId || userId === 'guest') {
          return state;
        }
        
        // Deep copy the guest conversation to the new user
        const copiedConversation = {
          messages: guestConversation.messages.map(msg => ({
            ...msg,
            id: crypto?.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`
          })),
          messageCount: guestConversation.messageCount
        };
        
        return {
          currentUserId: userId,
          conversations: {
            ...state.conversations,
            [userId]: copiedConversation
          }
        };
      }, false, 'copyGuestToUser'),
      
      // Get message count for current user
      getCurrentMessageCount: () => {
        const { conversations, currentUserId } = get();
        return conversations[currentUserId]?.messageCount || 0;
      },
      
      // Reset conversation for current user
      resetCurrentConversation: () => set((state) => ({
        conversations: {
          ...state.conversations,
          [state.currentUserId]: {
            messages: [createWelcomeMessage()],
            messageCount: 0
          }
        }
      }), false, 'resetCurrentConversation')
         }),
     {
       name: 'ozzie-chat-storage',
       // Only persist the conversations and currentUserId
       partialize: (state) => ({
         conversations: state.conversations,
         currentUserId: state.currentUserId
       })
     }
   ),
   {
     name: 'ozzie-chat-store' // Name that appears in Redux DevTools
   }
 )
); 