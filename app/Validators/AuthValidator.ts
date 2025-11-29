import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = {
    register: schema.create({
      username: schema.string({ trim: true }, [
        rules.unique({ table: 'users', column: 'username' }),
      ]),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({}, [
        rules.minLength(8),
      ]),
    }),
    login: schema.create({
      email: schema.string({ trim: true }, [rules.email()]),
      password: schema.string(),
    }),
  }

  public async validateRegister() {
    return await this.ctx.request.validate({ schema: this.schema.register })
  }

  public async validateLogin() {
    return await this.ctx.request.validate({ schema: this.schema.login })
  }
}
