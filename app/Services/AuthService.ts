import User from 'App/Models/User'
import UserRepository from 'App/Repositories/UserRepository'
import type { RegisterRequestDTO, LoginRequestDTO, AuthResponseDTO } from 'App/DTO/AuthDTO'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  public async register(payload: RegisterRequestDTO): Promise<User> {
    try {
      return await this.userRepository.create(payload)
    } catch (error) {

      throw error
    }
  }

  public async login(
    ctx: HttpContextContract,
    payload: LoginRequestDTO
  ): Promise<AuthResponseDTO> {
    try {
      const token = await ctx.auth.use('api').attempt(payload.email, payload.password, {
        expiresIn: '7 days',
      })

      const user = await this.userRepository.findByEmail(payload.email)
      if (!user) {
        throw new Error('User not found after login')
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt.toISO(),
          updatedAt: user.updatedAt.toISO(),
        },
        token: token.token,
      }
    } catch (error) {
      throw error
    }
  }

  public async logout(ctx: HttpContextContract): Promise<void> {
    try {
      await ctx.auth.use('api').revoke()
    } catch (error) {
      throw error
    }
  }

  public async getCurrentUser(user: User | null) {
    if (!user) {
      throw new Error('User not authenticated')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISO(),
      updatedAt: user.updatedAt.toISO(),
    }
  }
}
