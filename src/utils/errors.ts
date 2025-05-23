export class AppError extends Error {
  statusCode: number
  statusText?: string
  constructor(message: string, statusCode = 400, statusText?: string) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.statusText = statusText
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, statusText?: string) {
    super(message, 400, statusText)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, statusText?: string) {
    super(message, 404, statusText)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, statusText?: string) {
    super(message, 401, statusText)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, statusText?: string) {
    super(message, 409, statusText)
  }
}

export class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500)
  }
}
