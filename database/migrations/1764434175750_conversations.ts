import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ConversationsSchema extends BaseSchema {
  protected tableName = 'conversations'
  protected schemaName = 'chatbot'

  public async up () {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.uuid('id').primary()

      table
        .uuid('created_by')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('session_id').notNullable()

      table.text('last_message').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.index(['created_at'], 'idx_conversations_created_at')
      table.index(['created_by'], 'idx_conversations_created_by')
    })
  }

  public async down () {
    this.schema.withSchema(this.schemaName).dropTable(this.tableName)
  }
}
  