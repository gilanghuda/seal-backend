import Conversation from 'App/Models/Conversation'
import Message from 'App/Models/Message'
import CursorBasedPagination from 'App/Utils/cursorBasedPagination'
import { v7 as uuidv7 } from 'uuid'

export default class ChatRepository {
  public async createConversation(userId: string) {
    return await Conversation.create({
      id: uuidv7(),
      createdBy: userId,
      sessionId: uuidv7(),
      lastMessage: null,
    })
  }

  public async getConversationById(conversationId: string, userId: string) {
    return await Conversation.query()
      .where('id', conversationId)
      .where('created_by', userId)
      .preload('messages', (query) => {
        query.orderBy('created_at', 'asc')
      })
      .first()
  }

  public async getConversationBySessionId(sessionId: string, userId: string) {
    return await Conversation.query()
      .where('session_id', sessionId)
      .where('created_by', userId)
      .first()
  }

  public async createMessage(
    conversationId: string,
    senderType: 'user' | 'bot',
    content: string,
    suggestLinks: Array<{ title: string; link: string }> | null = null
  ) {
    const serializedLinks = suggestLinks && suggestLinks.length > 0 ? suggestLinks : null

    return await Message.create({
      id: uuidv7(),
      conversationId,
      senderType,
      message: content,
      suggestLinks: serializedLinks,
    })
  }

  public async updateLastMessage(conversationId: string, lastMessage: string) {
    const conversation = await Conversation.findOrFail(conversationId)
    conversation.lastMessage = lastMessage
    await conversation.save()
    return conversation
  }

  public async getMessagesWithCursor(
    conversationId: string,
    limit: number = 20,
    cursor?: string
  ) {
    const { decodedCursor } = CursorBasedPagination.getQueryConditions(cursor)
    let query = Message.query().where('conversation_id', conversationId)
    if (decodedCursor) {
      const cursorMessage = await Message.find(decodedCursor)
      if (cursorMessage) {
        query = query.where('created_at', '<', cursorMessage.createdAt.toJSDate())
      }
    }

    const messages = await query.orderBy('created_at', 'desc').limit(limit + 1)
    return CursorBasedPagination.buildResult(messages, limit, 'id')
  }

  public async getConversationsWithCursor(
    userId: string,
    limit: number = 10,
    cursor?: string
  ) {
    const { decodedCursor } = CursorBasedPagination.getQueryConditions(cursor)

    let query = Conversation.query().where('created_by', userId)
    if (decodedCursor) {
      const cursorConv = await Conversation.find(decodedCursor)
      if (cursorConv) {
        query = query.where('created_at', '<', cursorConv.createdAt.toJSDate())
      }
    }

    const conversations = await query.orderBy('created_at', 'desc').limit(limit + 1)
    return CursorBasedPagination.buildResult(conversations, limit, 'id')
  }



  public async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await Conversation.query()
      .where('id', conversationId)
      .where('created_by', userId)
      .first()

    if (!conversation) {
      return false
    }

    await Message.query().where('conversation_id', conversationId).delete()    
    await conversation.delete()

    return true
  }
}
