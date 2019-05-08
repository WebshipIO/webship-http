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
  setHeader(key: string, value: number | string | string[]): void
  getHeader(key: string): number | string | string[] | undefined
  hasHeader(key: string): boolean
  removeHeader(key: string): void
  keysOfHeaders(): Iterable<string>
  valuesOfHeaders(): Iterable<number | string | string[]>
  entriesOfHeaders(): Iterable<[string, number | string | string[]]>
  getHeaders(): OutgoingHttpHeaders
}

export class ServerResponseImpl implements ServerResponse {
  public  status: HttpStatus = 200
  public  body: Object | string | Readable = null
  private headers: OutgoingHttpHeaders = Object.create(null)

  public setHeader(key: string, value: number | string | string[]) {
    this.headers[key] = value
  }

  public getHeader(key: string): number | string | string[] | undefined {
    return this.headers[key]
  }

  public hasHeader(key: string): boolean {
    return Reflect.has(this.headers, key)
  }

  public removeHeader(key: string) {
    return Reflect.deleteProperty(this.headers, key)
  }

  public * keysOfHeaders(): Iterable<string> {
    for (let key in this.headers) {
      yield key
    }
  }

  public * valuesOfHeaders(): Iterable<number | string | string[]> {
    for (let key in this.headers) {
      yield Reflect.get(this.headers, key)
    }
  }

  public * entriesOfHeaders(): Iterable<[string, number | string | string[]]> {
    for (let key in this.headers) {
      yield [key, Reflect.get(this.headers, key)]
    }
  }

  public getHeaders(): OutgoingHttpHeaders {
    return this.headers
  }
}
