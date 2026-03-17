import { create } from 'zustand'

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

  createConversation: () => string
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
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  selectedProvider: 'openai',
  selectedModel: 'gpt-4o',
  isLoading: false,
  systemPrompt: '',

  createConversation: () => {
    const id = crypto.randomUUID()
    const { selectedProvider, selectedModel } = get()
    const conversation: Conversation = {
      id,
      title: 'Nouvelle conversation',
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
                  ? message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '')
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
}))
