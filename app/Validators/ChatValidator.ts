import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChatValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    conversation_id: schema.string.optional([
      rules.regex(/^[0-9a-fA-F-]{36}$/), 
    ]),
    question: schema.string([
      rules.minLength(1),
      rules.maxLength(5000),
      rules.trim(),
    ]),
  })

  public messages = {
    'question.required': 'Question is required',
    'question.minLength': 'Question must be at least 1 character',
    'question.maxLength': 'Question must not exceed 5000 characters',
    'conversation_id.regex': 'Invalid conversation ID format',
  }

  public async validate() {
    try {
      return await this.ctx.request.validate({
        schema: this.schema,
        messages: this.messages,
      })
    } catch (error) {
      throw error
    }
  }
}
