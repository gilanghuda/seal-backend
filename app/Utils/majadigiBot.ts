import axios from 'axios'
import Logger from '@ioc:Adonis/Core/Logger'

export interface ChatbotRequestPayload {
  question: string
  additional_context: string
  session_id: string
}

export interface ChatbotResponse {
  success: boolean
  data?: any
  error?: any
}

export interface ExtractedBotResponse {
  text: string
  suggestLinks: Array<{ title: string; link: string }> | null
}

export default class ChatbotClient {
  private static BASE_URL = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message'

  public static async sendMessage(payload: ChatbotRequestPayload): Promise<ChatbotResponse> {
    try {
      Logger.info({ url: this.BASE_URL, payload }, '[MAJADIGI] Sending request to external API')

      const response = await axios.post(this.BASE_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      })

      Logger.info(
        {
          statusCode: response.status,
          statusText: response.statusText,
          data: response.data,
        },
        '[MAJADIGI] Response received successfully'
      )

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {


      Logger.error(
        {
          errorType: error.constructor.name,
          errorMessage: error.message,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
        },
        '[MAJADIGI] Request failed'
      )

      return {
        success: false,
        error: error.response?.data || error.message,
      }
    }
  }

  public static extractMessageText(botResponseData: any): string {
    try {
      const nestedData = botResponseData?.data
      if (!nestedData) {
        Logger.warn('[EXTRACTION] No data property in response')
        return 'No response'
      }
 
      const messageArray = nestedData?.message

      if (!messageArray || !Array.isArray(messageArray) || messageArray.length === 0) {
        Logger.warn('[EXTRACTION] messageArray is empty or not array')
        return 'No response'
      }

      const firstMessage = messageArray[0]
      const text = firstMessage?.text || 'No response'
      Logger.info({ extractedText: text.substring(0, 100) }, '[EXTRACTION] Text successfully extracted')
      return text

    } catch (error) {
      Logger.error({ error }, '[EXTRACTION] Error extracting message text')
      return 'No response'
    }
  }

  public static extractSuggestLinks(
    botResponseData: any
  ): Array<{ title: string; link: string }> | null {
    try {
      const nestedData = botResponseData?.data
      if (!nestedData) {
        Logger.warn('[EXTRACTION] No data property in response')
        return null
      }

      const messageArray = nestedData?.message
      if (!messageArray || !Array.isArray(messageArray) || messageArray.length === 0) {
        Logger.warn('[EXTRACTION] messageArray is empty')
        return null
      }

      const firstMessage = messageArray[0]

      if (!firstMessage?.suggest_links || !Array.isArray(firstMessage.suggest_links)) {
        Logger.warn('[EXTRACTION] suggest_links not found or not array')
        return null
      }

      // Map and filter valid suggest links
      const filteredLinks = firstMessage.suggest_links
        .filter((link: any) => link?.title && link?.link)
        .map((link: any) => ({
          title: link.title,
          link: link.link,
        }))

      Logger.info({ linksCount: filteredLinks.length }, '[EXTRACTION] Suggest links extracted')

      return filteredLinks.length > 0 ? filteredLinks : null
    } catch (error) {
      Logger.error({ error }, '[EXTRACTION] Error extracting suggest links')
      return null
    }
  }

  public static extractBotResponse(botResponseData: any): ExtractedBotResponse {
    const text = this.extractMessageText(botResponseData)
    const suggestLinks = this.extractSuggestLinks(botResponseData)

    return {
      text,
      suggestLinks,
    }
  }
}
