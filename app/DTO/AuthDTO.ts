export interface RegisterRequestDTO {
  username: string
  email: string
  password: string
}

export interface LoginRequestDTO {
  email: string
  password: string
}

export interface AuthResponseDTO {
  user: {
    id: string
    username: string
    email: string
    createdAt: string | null
    updatedAt: string | null
  }
  token: string
}

export interface UserDTO {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface TokenDTO {
  type: string
  token: string
  expiresIn?: string
}
