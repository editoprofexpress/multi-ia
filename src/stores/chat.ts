import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ConversationCategory = 'chat' | 'image' | 'video' | 'audio' | 'search'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  providerId?: string
  modelId?: string
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  category: ConversationCategory
  messages: Message[]
  providerId: string
  modelId: string
  createdAt: Date
  updatedAt: Date
}

type ChatStore = {
  conversations: Conversation[]
  activeConversationId: string | null
  selectedProvider: string
  selectedModel: string
  isLoading: boolean
  systemPrompt: string

  createConversation: (category?: ConversationCategory) => string
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (conversationId: string, messageId: string, content: string) => void
  setMessageStreaming: (conversationId: string, messageId: string, isStreaming: boolean) => void
  setSelectedProvider: (id: string) => void
  setSelectedModel: (id: string) => void
  setLoading: (loading: boolean) => void
  setSystemPrompt: (prompt: string) => void
  deleteConversation: (id: string) => void
  getActiveConversation: () => Conversation | null
  getConversationsByCategory: (category: ConversationCategory) => Conversation[]
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      selectedProvider: 'openai',
      selectedModel: 'gpt-4o',
      isLoading: false,
      systemPrompt: '',

      createConversation: (category = 'chat') => {
        const id = crypto.randomUUID()
        const { selectedProvider, selectedModel } = get()
        const conversation: Conversation = {
          id,
          title: 'Nouvelle conversation',
          category,
          messages: [],
          providerId: selectedProvider,
          modelId: selectedModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set(state => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }))
        return id
      },

      setActiveConversation: id => set({ activeConversationId: id }),

      addMessage: (conversationId, message) => {
        const id = crypto.randomUUID()
        const newMessage: Message = { ...message, id, timestamp: new Date() }
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  title:
                    c.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : c.title,
                  updatedAt: new Date(),
                }
              : c
          ),
        }))
        return id
      },

      updateMessage: (conversationId, messageId, content) =>
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                }
              : c
          ),
        })),

      setMessageStreaming: (conversationId, messageId, isStreaming) =>
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, isStreaming } : m
                  ),
                }
              : c
          ),
        })),

      setSelectedProvider: id => set({ selectedProvider: id }),
      setSelectedModel: id => set({ selectedModel: id }),
      setLoading: loading => set({ isLoading: loading }),
      setSystemPrompt: prompt => set({ systemPrompt: prompt }),
      deleteConversation: id =>
        set(state => ({
          conversations: state.conversations.filter(c => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get()
        return conversations.find(c => c.id === activeConversationId) ?? null
      },
      getConversationsByCategory: (category) => {
        return get().conversations
          .filter(c => c.category === category)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      },
    }),
    {
      name: 'ai-hub-conversations',
      partialize: (state) => ({
        conversations: state.conversations.map(c => ({
          ...c,
          messages: c.messages.map(m => ({ ...m, isStreaming: false })),
        })),
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        systemPrompt: state.systemPrompt,
      }),
    }
  )
)
