import User from 'App/Models/User'
import type { RegisterRequestDTO } from 'App/DTO/AuthDTO'

export default class UserRepository {
  public async create(payload: RegisterRequestDTO): Promise<User> {
    return await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    })
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await User.findBy('email', email)
  }

  public async findById(id: string): Promise<User | null> {
    return await User.find(id)
  }
}
