import {OutgoingHttpHeaders} from 'http'
import {Readable} from 'stream'

export type HttpStatus = 100 | 101 | 102 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 
                         300 | 301 | 302 | 303 | 304 | 305 | 307 | 308 |
                         400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 
                         417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 
                         500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

export class ServerResponse {
  private _status: HttpStatus = 200
  private _headers: OutgoingHttpHeaders = Object.create(null)
  private _body: Object | string | Readable = null

  public get status(): HttpStatus {
    return this._status
  }

  public set status(status: HttpStatus) {
    this._status = status
  }

  public setHeader(name: string, value: number | string | string[]) {
    this._headers[name] = value
  }

  public getHeader(name: string): number | string | string[] | undefined {
    return this._headers[name]
  }

  public get headers(): OutgoingHttpHeaders {
    return this._headers
  }

  public get body(): Object | string | Readable {
    return this._body
  }

  public set body(body: Object | string | Readable) {
    this._body = body
  }
}
