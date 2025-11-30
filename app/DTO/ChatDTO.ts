export interface SendQuestionRequestDTO {
  conversation_id?: string // Optional, will create new conversation if not provided
  question: string
}

export interface SuggestLink {
  title: string
  link: string
}

export interface MessageDTO {
  id: string
  sender_type: 'user' | 'bot'
  message: string
  suggest_links?: SuggestLink[] | null
  created_at: string | null
}

export interface ConversationDTO {
  id: string
  session_id: string
  last_message: string | null
  created_at: string | null
  updated_at: string | null
}

export interface SendQuestionResponseDTO {
  conversation: ConversationDTO
  user_message: MessageDTO | null
  bot_message: MessageDTO | null
}

export interface ConversationMessagesDTO {
  id: string
  session_id: string
  created_at: string
  updated_at: string
  messages: MessageDTO[]
}

export interface PaginationMeta {
  next_cursor: string | null
  has_more: boolean
  limit: number
}

export interface ConversationMessagesPaginatedDTO {
  conversation: ConversationDTO
  messages: MessageDTO[]
  pagination: PaginationMeta
}

export interface ConversationListPaginatedDTO {
  conversations: ConversationDTO[]
  pagination: PaginationMeta
}


export interface CursorPaginationOptions {
  limit: number
  cursor?: string
}

export interface CursorPaginationResult<T> {
  data: T[]
  pagination: {
    next_cursor: string | null
    has_more: boolean
    limit: number
  }
}