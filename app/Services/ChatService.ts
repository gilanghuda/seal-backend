import ChatRepository from 'App/Repositories/ChatRepository'
import ChatbotClient from 'App/Utils/majadigiBot'
import {
  SendQuestionRequestDTO,
  SendQuestionResponseDTO,
  ConversationMessagesPaginatedDTO,
  ConversationListPaginatedDTO,
} from 'App/DTO/ChatDTO'
import User from 'App/Models/User'
import Logger from '@ioc:Adonis/Core/Logger'
import { buildAdditionalContext } from 'App/Utils/buildContext'

export default class ChatService {
  private chatRepository: ChatRepository

  constructor() {
    this.chatRepository = new ChatRepository()
  }

  public async sendQuestion(
    user: User,
    payload: SendQuestionRequestDTO
  ): Promise<SendQuestionResponseDTO> {
    try {
      Logger.info({ userId: user.id, question: payload.question }, '[SERVICE] Starting sendQuestion')

      let conversation: any = null
      let additionalContext = ''

      if (payload.conversation_id) {
        Logger.debug({ conversationId: payload.conversation_id }, '[SERVICE] Getting existing conversation')
        conversation = await this.chatRepository.getConversationById(payload.conversation_id, user.id)
        if (!conversation) {
          throw new Error('Conversation not found or unauthorized')
        }

        if (conversation.messages && conversation.messages.length > 0) {
          additionalContext = buildAdditionalContext(conversation.messages)
          Logger.debug(
            { contextLength: additionalContext.length, messageCount: conversation.messages.length },
            '[SERVICE] Additional context built from history'
          )
        }
      } else {
        Logger.debug({ userId: user.id }, '[SERVICE] Creating new conversation')
        conversation = await this.chatRepository.createConversation(user.id)
      }

      Logger.debug(
        { conversationId: conversation.id, sessionId: conversation.sessionId },
        '[SERVICE] Conversation ready'
      )

      const userMessage = await this.chatRepository.createMessage(
        conversation.id,
        'user',
        payload.question,
        null
      )

      if (!userMessage) {
        throw new Error('Failed to create user message')
      }

      Logger.debug({ userMessageId: userMessage.id }, '[SERVICE] User message saved')

      Logger.info(
        { sessionId: conversation.sessionId, contextLength: additionalContext.length },
        '[SERVICE] Calling external Majadigi API'
      )
      const botResponse = await ChatbotClient.sendMessage({
        question: payload.question,
        additional_context: additionalContext,
        session_id: conversation.sessionId,
      })

      Logger.debug({ botResponseSuccess: botResponse.success }, '[SERVICE] Bot response received')

      if (!botResponse.success) {
        Logger.error({ error: botResponse.error }, '[SERVICE] Chatbot API returned error')
        throw new Error(`Chatbot API error: ${JSON.stringify(botResponse.error)}`)
      }

      Logger.info('[SERVICE] Extracting bot response data')
      const extractedResponse = ChatbotClient.extractBotResponse(botResponse.data)

      Logger.info(
        {
          textLength: extractedResponse.text.length,
          suggestLinksCount: extractedResponse.suggestLinks?.length || 0,
        },
        '[SERVICE] Bot response extraction completed'
      )

      const botMessage = await this.chatRepository.createMessage(
        conversation.id,
        'bot',
        extractedResponse.text,
        extractedResponse.suggestLinks
      )

      if (!botMessage) {
        throw new Error('Failed to create bot message')
      }

      Logger.debug({ botMessageId: botMessage.id }, '[SERVICE] Bot message saved')

      await this.chatRepository.updateLastMessage(conversation.id, extractedResponse.text)

      Logger.info({ conversationId: conversation.id }, '[SERVICE] Conversation updated')

      return {
        conversation: {
          id: conversation.id,
          session_id: conversation.sessionId,
          last_message: extractedResponse.text,
          created_at: conversation.createdAt.toISO(),
          updated_at: conversation.updatedAt.toISO(),
        },
        user_message: {
          id: userMessage.id,
          sender_type: userMessage.senderType,
          message: userMessage.message,
          suggest_links: null,
          created_at: userMessage.createdAt.toISO(),
        },
        bot_message: {
          id: botMessage.id,
          sender_type: botMessage.senderType,
          message: botMessage.message,
          suggest_links: botMessage.suggestLinks,
          created_at: botMessage.createdAt.toISO(),
        },
      }
    } catch (error) {
      Logger.error({ error: error.message }, '[SERVICE] ChatService.sendQuestion failed')
      throw error
    }
  }

  public async getConversation(conversationId: string, userId: string) {
    try {
      Logger.debug({ conversationId, userId }, '[SERVICE] Getting conversation')

      const conversation = await this.chatRepository.getConversationById(conversationId, userId)

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      Logger.info(
        { conversationId, messageCount: conversation.messages.length },
        '[SERVICE] Conversation retrieved'
      )

      return {
        id: conversation.id,
        session_id: conversation.sessionId,
        created_at: conversation.createdAt.toISO(),
        updated_at: conversation.updatedAt.toISO(),
        messages: conversation.messages.map((msg) => ({
          id: msg.id,
          sender_type: msg.senderType,
          message: msg.message,
          suggest_links: msg.suggestLinks,
          created_at: msg.createdAt.toISO(),
        })),
      }
    } catch (error) {
      Logger.error({ error: error.message }, '[SERVICE] getConversation failed')
      throw error
    }
  }

  /**
   * Get conversation messages with cursor-based pagination
   */
  public async getConversationMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<ConversationMessagesPaginatedDTO> {
    try {
      Logger.debug(
        { conversationId, userId, cursor, limit },
        '[SERVICE] Getting conversation messages with cursor pagination'
      )

      const conversation = await this.chatRepository.getConversationById(conversationId, userId)

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const paginationResult = await this.chatRepository.getMessagesWithCursor(
        conversationId,
        limit,
        cursor,
      )

      Logger.info(
        { conversationId, count: paginationResult.data.length, hasMore: paginationResult.pagination.has_more },
        '[SERVICE] Conversation messages retrieved'
      )

      return {
        conversation: {
          id: conversation.id,
          session_id: conversation.sessionId,
          last_message: conversation.lastMessage,
          created_at: conversation.createdAt.toISO(),
          updated_at: conversation.updatedAt.toISO(),
        },
        messages: paginationResult.data.map((msg) => ({
          id: msg.id,
          sender_type: msg.senderType,
          message: msg.message,
          suggest_links: msg.suggestLinks,
          created_at: msg.createdAt.toISO(),
        })),
        pagination: {
          next_cursor: paginationResult.pagination.next_cursor || null,
          has_more: paginationResult.pagination.has_more || false,
          limit: paginationResult.pagination.limit,
        },
      }
    } catch (error) {
      Logger.error({ error: error.message }, '[SERVICE] getConversationMessages failed')
      throw error
    }
  }

  /**
   * Get user conversations with cursor-based pagination
   */
  public async getUserConversations(
    userId: string,
    limit: number = 10,
    cursor?: string
  ): Promise<ConversationListPaginatedDTO> {
    try {
      Logger.debug({ userId, cursor, limit }, '[SERVICE] Getting user conversations with cursor')

      const paginationResult = await this.chatRepository.getConversationsWithCursor(
        userId,
        limit,
        cursor,
      )

      Logger.info(
        { userId, count: paginationResult.data.length, hasMore: paginationResult.pagination.has_more },
        '[SERVICE] User conversations retrieved'
      )

      return {
        conversations: paginationResult.data.map((conv) => ({
          id: conv.id,
          session_id: conv.sessionId,
          last_message: conv.lastMessage,
          created_at: conv.createdAt.toISO(),
          updated_at: conv.updatedAt.toISO(),
        })),
        pagination: {
          next_cursor: paginationResult.pagination.next_cursor || null,
          has_more: paginationResult.pagination.has_more || false,
          limit: paginationResult.pagination.limit,
        },
      }
    } catch (error) {
      Logger.error({ error: error.message }, '[SERVICE] getUserConversations failed')
      throw error
    }
  }

  /**
   * Delete conversation with authorization check
   */
  public async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      Logger.debug({ conversationId, userId }, '[SERVICE] Deleting conversation')

      const conversation = await this.chatRepository.getConversationById(conversationId, userId)

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const deleted = await this.chatRepository.deleteConversation(conversationId, userId)

      if (!deleted) {
        throw new Error('Failed to delete conversation')
      }

      Logger.info({ conversationId, userId }, '[SERVICE] Conversation deleted successfully')
      return true
    } catch (error) {
      Logger.error({ error: error.message }, '[SERVICE] deleteConversation failed')
      throw error
    }
  }
}
