import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChatValidator from 'App/Validators/ChatValidator'
import ChatService from 'App/Services/ChatService'
import ResponseService from 'App/Services/ResponseService'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ChatsController {
  private chatService: ChatService

  constructor() {
    this.chatService = new ChatService()
  }

  public async sendQuestion({ auth, request, response }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const user = auth.use('api').user

      if (!user) {
        return responseService.unauthorized('User not authenticated')
      }

      const validator = new ChatValidator({ auth, request, response } as HttpContextContract)
      const payload = await validator.validate()

      const result = await this.chatService.sendQuestion(user, payload)

      return responseService.ok('Question sent successfully', result)
    } catch (error: any) {
      Logger.error({ error: error.message, errors: error.messages }, 'Chat controller error')

      if (error.messages) {
        let flattenedErrors: Record<string, string[]> = {}

        if (Array.isArray(error.messages)) {
          error.messages.forEach((err: any) => {
            if (err.field) {
              flattenedErrors[err.field] = [err.message]
            }
          })
        } else if (typeof error.messages === 'object') {
          flattenedErrors = error.messages
        }

        return responseService.badRequest('Validation failed', flattenedErrors)
      }

      if (error.message?.includes('not found')) {
        return responseService.badRequest('Conversation not found or unauthorized', {} as Record<string, string[]>)
      }

      if (error.message?.includes('Chatbot API error')) {
        return responseService.internalServerError('Failed to get response from chatbot')
      }

      return responseService.internalServerError('Failed to process question')
    }
  }

  public async getConversation({ auth, request, response, params }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const user = auth.use('api').user

      if (!user) {
        return responseService.unauthorized('User not authenticated')
      }

      const { conversationId } = params
      const messagesCursor = request.input('messages_cursor')
      const messagesLimit = Math.min(request.input('messages_limit', 20), 100) // Max 100

      const result = await this.chatService.getConversationMessages(
        conversationId,
        user.id,
        messagesCursor,
        messagesLimit
      )

      return responseService.ok('Conversation retrieved', result)
    } catch (error: any) {
      Logger.error({ error: error.message }, 'Get conversation error')

      if (error.message?.includes('not found')) {
        return responseService.notFound('Conversation not found')
      }

      return responseService.internalServerError('Failed to retrieve conversation')
    }
  }

  public async getConversations({ auth, request, response }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const user = auth.use('api').user

      if (!user) {
        return responseService.unauthorized('User not authenticated')
      }

      const cursor = request.input('cursor')
      const limit = Math.min(request.input('limit', 10), 100) // Max 100

      const result = await this.chatService.getUserConversations(user.id, limit, cursor)

      return responseService.ok('Conversations retrieved', result)
    } catch (error: any) {
      Logger.error({ error: error.message }, 'Get conversations error')
      return responseService.internalServerError('Failed to retrieve conversations')
    }
  }

  public async deleteConversation({ auth, request, response, params }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const user = auth.use('api').user

      if (!user) {
        return responseService.unauthorized('User not authenticated')
      }

      const { conversationId } = params

      await this.chatService.deleteConversation(conversationId, user.id)

      return responseService.ok('Conversation deleted successfully')
    } catch (error: any) {
      Logger.error({ error: error.message }, 'Delete conversation error')

      if (error.message?.includes('not found')) {
        return responseService.notFound('Conversation not found or unauthorized')
      }

      return responseService.internalServerError('Failed to delete conversation')
    }
  }
}
