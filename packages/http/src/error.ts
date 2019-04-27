import {STATUS_CODES} from 'http'

export enum HttpErrorCode {
  BAD_REQEUST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  NOT_ACCEPTABLE,
  PROXY_AUTHENTICATION_REQUIRED,
  REQUEST_TIMEOUT,
  CONFLIT,
  INTERNAL_SERVER_ERROR,
  BAD_GATEWAY,
  GATEWAY_TIMEOUT
}

export class HttpError extends Error {
  public static create(code: HttpErrorCode, msg?: string, stack?: string): HttpError {
    return new HttpError(code, msg, stack)
  }
  
  public readonly statusCode: number
  public readonly message: string

  constructor(code: HttpErrorCode, msg?: string, stack?: string) {
    let statusCode: number
    let message: string
    switch (code) {
    case HttpErrorCode.BAD_REQEUST:
      statusCode = 400
      message = STATUS_CODES[statusCode]
      break  
    case HttpErrorCode.UNAUTHORIZED:
      statusCode = 401
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.FORBIDDEN:
      statusCode = 403
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.NOT_FOUND:
      statusCode = 404
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.METHOD_NOT_ALLOWED:
      statusCode = 405
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.NOT_ACCEPTABLE:
      statusCode = 406
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.PROXY_AUTHENTICATION_REQUIRED:
      statusCode = 407
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.REQUEST_TIMEOUT:
      statusCode = 408
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.CONFLIT:
      statusCode = 409
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.INTERNAL_SERVER_ERROR:
      statusCode = 500
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.BAD_GATEWAY:
      statusCode = 502
      message = STATUS_CODES[statusCode]
      break
    case HttpErrorCode.GATEWAY_TIMEOUT:
      statusCode = 504
      message = STATUS_CODES[statusCode]
      break
    default:
      statusCode = 500
      message = STATUS_CODES[statusCode]
      break
    }
    if (typeof msg === 'string') {
      message = msg
    } 
    super(message)
    this.statusCode = statusCode
    this.message = message
    if (typeof stack === 'string') {
      this.stack = this.stack + '\n' + stack
    }
  }
}

export function cond(condition: boolean, code: HttpErrorCode, msg?: string, stack?: string): void {
  if (!condition) {
    throw new HttpError(code, msg, stack)
  }
}