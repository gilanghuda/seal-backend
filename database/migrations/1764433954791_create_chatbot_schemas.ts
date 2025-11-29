import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateChatbotSchema extends BaseSchema {
  public async up () {
    this.schema.raw('CREATE SCHEMA IF NOT EXISTS chatbot')
  }

  public async down () {
    this.schema.raw('DROP SCHEMA IF EXISTS chatbot CASCADE')
  }
}
