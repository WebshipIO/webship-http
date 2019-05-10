import {OutgoingHttpHeaders, ServerResponse as NativeServerResponse} from 'http'
import {Readable} from 'stream'

export type HttpStatus = 100 | 101 | 102 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 
                         300 | 301 | 302 | 303 | 304 | 305 | 307 | 308 |
                         400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 
                         417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 
                         500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

export interface ServerResponse {
  status: HttpStatus
  body: Object | string | Readable
  headers: OutgoingHttpHeaders
  setHeader(key: string, value: number | string | string[]): void
  getHeader(key: string): number | string | string[] | undefined
  hasHeader(key: string): boolean
  removeHeader(key: string): void
  keysOfHeaders(): Iterable<string>
  valuesOfHeaders(): Iterable<number | string | string[]>
  entriesOfHeaders(): Iterable<[string, number | string | string[]]>
}

export class ServerResponseImpl implements ServerResponse {
  public  status: HttpStatus = 200
  public  body: Object | string | Readable = null
  private _headers: OutgoingHttpHeaders = Object.create(null)

  public setHeader(key: string, value: number | string | string[]) {
    this._headers[key] = value
  }

  public getHeader(key: string): number | string | string[] | undefined {
    return this._headers[key]
  }

  public hasHeader(key: string): boolean {
    return Reflect.has(this._headers, key)
  }

  public removeHeader(key: string) {
    Reflect.deleteProperty(this._headers, key)
  }

  public * keysOfHeaders(): Iterable<string> {
    for (let key in this._headers) {
      yield key
    }
  }

  public * valuesOfHeaders(): Iterable<number | string | string[]> {
    for (let key in this._headers) {
      yield Reflect.get(this._headers, key)
    }
  }

  public * entriesOfHeaders(): Iterable<[string, number | string | string[]]> {
    for (let key in this._headers) {
      yield [key, Reflect.get(this._headers, key)]
    }
  }

  public get headers(): OutgoingHttpHeaders {
    return this._headers
  }

  public set headers(_headers: OutgoingHttpHeaders)  {
    this._headers = _headers
  }
}
