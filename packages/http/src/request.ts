import {UrlWithParsedQuery} from 'url'
import {IncomingHttpHeaders, IncomingMessage as NativeServerRequest} from 'http'
import {Context, ApplicationContext, SessionContext, RequestContext} from '@webnode/cdi'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'PATCH'
export type RePathname = string

export interface RePathnameParams {
  [key: string]: string
}  

export interface ServerRequest {
  readonly httpVersion: string
  readonly httpVersionMajor: number
  readonly httpVersionMinor: number
  readonly method: HttpMethod
  readonly url: UrlWithParsedQuery
  readonly params: RePathnameParams
  readonly headers: IncomingHttpHeaders
  readonly body: Object | string
  readonly context: RequestContext
}

