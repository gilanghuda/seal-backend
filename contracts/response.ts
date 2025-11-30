import User from 'App/Models/User'

export interface ApiResponseMeta {
  timestamp: string
  requestId?: string
}

export interface ApiResponse<T = null> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
  meta?: ApiResponseMeta
}

export interface AuthResponseData {
  user: Pick<User, 'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'>
  token: string
}

export interface UserResponseData {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface SuggestLink {
  title: string
  link: string
}

export interface ChatbotRequestPayload {
  session_id: string
  message: string
}

export interface ChatbotResponse {
  success: boolean
  data?: any
  error?: any
}

export type RegisterResponse = ApiResponse<AuthResponseData>
export type LoginResponse = ApiResponse<AuthResponseData>
export type LogoutResponse = ApiResponse<null>
export type MeResponse = ApiResponse<UserResponseData>
export type ChatbotRequestType = ApiResponse<ChatbotRequestPayload>
export type ChatbotResponseType = ApiResponse<ChatbotResponse>