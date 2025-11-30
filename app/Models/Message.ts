import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Conversation from 'App/Models/Conversation'

export default class Message extends BaseModel {
  public static table = 'chatbot.messages'


  @column({ isPrimary: true })
  public id: string

  @column()
  public conversationId: string

  @column()
  public senderType: 'user' | 'bot'

  @column()
  public message: string

  @column({
  prepare: (value) => {
    if (!value) return null
    return JSON.stringify(value) 
  },
  consume: (value) => {
    if (!value) return null
    return typeof value === 'string' ? JSON.parse(value) : value
  },
  })
  public suggestLinks: any



  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime


  @belongsTo(() => Conversation, {
    foreignKey: 'conversationId',
  })
  public conversation: BelongsTo<typeof Conversation>
}
