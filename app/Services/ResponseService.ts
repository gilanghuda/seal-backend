import type { RequestContract } from '@ioc:Adonis/Core/Request'
import type { ApiResponse } from 'Contracts/response'
import type { ResponseContract as Response } from '@ioc:Adonis/Core/Response'

export default class ResponseService {
  constructor(private response: Response, private request: RequestContract) {}

  private buildResponse<T>(
    success: boolean,
    message: string,
    data?: T,
    errors?: Record<string, string[]>
  ): ApiResponse<T> {
    return {
      success,
      message,
      ...(data !== undefined && { data }),
      ...(errors && { errors }),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: this.request.id(),
      },
    }
  }

  public created<T>(message: string, data: T) {
    return this.response.created(this.buildResponse(true, message, data))
  }

  public ok<T>(message: string, data?: T) {
    return this.response.ok(this.buildResponse(true, message, data))
  }

  public badRequest(message: string, errors: Record<string, string[]>) {
    return this.response.badRequest(this.buildResponse(false, message, undefined, errors))
  }
  public unauthorized(message: string) {
    return this.response.unauthorized(this.buildResponse(false, message))
  }

  public forbidden(message: string) {
    return this.response.forbidden(this.buildResponse(false, message))
  }

  public notFound(message: string) {
    return this.response.notFound(this.buildResponse(false, message))
  }

  public internalServerError(message: string) {
    return this.response.internalServerError(this.buildResponse(false, message))
  }
}
