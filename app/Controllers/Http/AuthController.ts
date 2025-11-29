import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthValidator from 'App/Validators/AuthValidator'
import AuthService from 'App/Services/AuthService'
import ResponseService from 'App/Services/ResponseService'

export default class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  public async register({ request, response }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const validator = new AuthValidator({ request, response } as HttpContextContract)
      const payload = await validator.validateRegister()
      const user = await this.authService.register(payload)

      return responseService.created('User registered successfully', {
        user: user.serialize(),
        token: null,
      })
    } catch (error) {
      if (error.messages) {
        return responseService.badRequest('Validation failed', error.messages)
      }
      return responseService.internalServerError('Registration failed')
    }
  }

  public async login(ctx: HttpContextContract) {
    const { request, response } = ctx
    const responseService = new ResponseService(response, request)

    try {
      const validator = new AuthValidator(ctx)
      const payload = await validator.validateLogin()
      const result = await this.authService.login(ctx, payload)

      return responseService.ok('Login successful', result)
    } catch (error) {
      if (error.messages) {
        return responseService.badRequest('Validation failed', error.messages)
      }
      return responseService.unauthorized('Invalid email or password')
    }
  }

  public async logout(ctx: HttpContextContract) {
    const { request, response } = ctx
    const responseService = new ResponseService(response, request)

    try {
      await this.authService.logout(ctx)
      return responseService.ok('Logout successful')
    } catch {
      return responseService.internalServerError('Logout failed')
    }
  }

  public async me({ auth, request, response }: HttpContextContract) {
    const responseService = new ResponseService(response, request)

    try {
      const user = auth.use('api').user

      if (!user) {
        return responseService.unauthorized('User not authenticated')
      }

      const userData = await this.authService.getCurrentUser(user)
      return responseService.ok('Profile retrieved', userData)
    } catch {
      return responseService.unauthorized('User not authenticated')
    }
  }
}
