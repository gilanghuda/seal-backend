import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Message from 'App/Models/Message'

export default class Conversation extends BaseModel {
  public static table = 'chatbot.conversations'

  @column({ isPrimary: true })
  public id: string

  @column()
  public createdBy: string

  @column()
  public sessionId: string

  @column()
  public lastMessage: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Message, {
    foreignKey: 'conversationId',
  })
  public messages: HasMany<typeof Message>
}
