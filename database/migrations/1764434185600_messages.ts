import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MessagesSchema extends BaseSchema {
  protected tableName = 'messages'
  protected schemaName = 'chatbot'

  public async up () {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('conversation_id')
        .notNullable()
        .references('id')
        .inTable('chatbot.conversations') 
        .onDelete('CASCADE')

      table
        .enum('sender_type', ['user', 'bot'])
        .notNullable()

      table.text('message').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['conversation_id', 'created_at'], 'idx_messages_conv_created_at')
    })
  }

  public async down () {
    this.schema.withSchema(this.schemaName).dropTable(this.tableName)
  }
}