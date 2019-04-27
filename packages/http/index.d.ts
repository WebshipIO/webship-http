/// <reference types="node" />

import Http = require("http")
import Net = require("net")
import Url = require("url")
import Stream = require('stream')
import Events = require("events")
import Cdi = require("@webnode/cdi")

declare namespace WebNode {
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
    public static create(code: HttpErrorCode, msg?: string, stack?: string): HttpError

    public readonly statusCode: number
    public readonly message: string

    constructor(code: HttpErrorCode, msg?: string, stack?: string)
  }

  export function cond(condition: boolean, code: HttpErrorCode, msg?: string, stack?: string): void

  export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'PATCH'
  export type RePathname = string

  export interface RePathnameParams {
    [key: string]: string
  }  

  export class ServerRequest {
    public readonly method: HttpMethod
    public readonly uri: Url.UrlWithParsedQuery
    public readonly params: RePathnameParams
    public readonly headers: Http.OutgoingHttpHeaders
    public readonly body: Object | string
    public readonly sessionIdent: Cdi.Cdi.SessionIdentifier
    public readonly requestIdent: Cdi.Cdi.RequestIdentifier
  }

  export type HttpStatus = 100 | 101 | 102 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 
                         300 | 301 | 302 | 303 | 304 | 305 | 307 | 308 |
                         400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 
                         417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 
                         500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

  export class ServerResponse {
    public status: HttpStatus
    public body: Object | string | Stream.Readable
    public setHeader(name: string, value: number | string | string[]): void
    public getHeader(name: string): number | string | string[] | undefined 
    public readonly headers: Http.OutgoingHttpHeaders
  }

  export interface FormConfig {
    formKeepExtensions?: boolean
    formUploadDir?: string
    formMaxFieldsSize?: number
    formMaxFields?: number
    formMaxFileSize?: number
    formMultiples?: boolean
  }

  export interface ServerConfig extends FormConfig {
    hostname?: string
    port?: number
    keepAliveTimeout?: number
    timeout?: number
  }

  export class HttpServer {
    public static create(config?: ServerConfig): HttpServer

    constructor(config?: ServerConfig)
    public registerProvider(scope: Cdi.Scope, key: Cdi.ProviderKey, provider: Cdi.Provider): void
    public unregisterProvider(scope: Cdi.Scope, key: Cdi.ProviderKey): void
    public getApplicationScopeProviderInstance(key: Cdi.ProviderKey): Cdi.ProviderInstance
    public hasApplicationScopeProviderInstance(key: Cdi.ProviderKey): boolean
    public getSessionScopeProviderInstance(key: Cdi.ProviderKey, sessionIdent: Cdi.SessionIdentifier): Cdi.ProviderInstance
    public hasSessionScopeProviderInstance(key: Cdi.ProviderKey, sessionIdent: Cdi.SessionIdentifier): Cdi.ProviderInstance
    public getRequestScopeProviderInstance(key: Cdi.ProviderKey, sessionIdent: Cdi.SessionIdentifier, requestIdent: Cdi.RequestIdentifier): Cdi.ProviderInstance 
    public hasRequestScopeProviderInstance(key: Cdi.ProviderKey, sessionIdent: Cdi.SessionIdentifier, requestIdent: Cdi.RequestIdentifier): Cdi.ProviderInstance
    public serve(): Promise<void>
    public close(): Promise<void>
    public address(): Net.AddressInfo
  }
}

export = WebNode
