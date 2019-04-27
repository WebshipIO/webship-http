import {UrlWithParsedQuery} from 'url'
import {OutgoingHttpHeaders} from 'http'
import {SessionIdentifier, RequestIdentifier} from '@webnode/cdi'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'PATCH'
export type RePathname = string

export interface RePathnameParams {
  [key: string]: string
}  

export class ServerRequest {
  public readonly method: HttpMethod
  public readonly uri: UrlWithParsedQuery
  public readonly params: RePathnameParams
  public readonly headers: OutgoingHttpHeaders
  public readonly body: Object | string
  public readonly sessionIdent: SessionIdentifier
  public readonly requestIdent: RequestIdentifier
}