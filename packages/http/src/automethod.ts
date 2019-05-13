import {ClassType, Node, ApplicationContext} from '@webnode/cdi'
import {ServerRequest} from './request'
import {ServerResponse, HttpStatus} from './response'

export enum ParameterPoint {
  REQUEST, 
  REQUEST_URL, 
  REQUEST_QUERY, 
  REQUEST_HEADERS, 
  REQUEST_PARAMS, 
  REQUEST_BODY, 
  RESPONSE, 
  ERROR
}

export type AutoMethod = (...args: Array<any>) => void | Promise<void>
export type Middleware = (req: ServerRequest, res: ServerResponse) => boolean | Promise<boolean>

export class AutoMethodProperties {
  private parameters: Map<number, ParameterPoint>
  private middlewares?: Array<Middleware>

  constructor(private node: Node) {
  }

  public getNode(): Node {
    return this.node
  }

  public setParameter(index: number, point: ParameterPoint) {
    if (this.parameters === undefined) {
      this.parameters = new Map()
    }
    this.parameters.set(index, point)
  }

  public hasParameters(): boolean {
    if (this.parameters === undefined) {
      return false
    }
    return this.parameters.size > 0
  }

  public * entriesOfParameters(): Iterable<[number, ParameterPoint]> {
    if (this.parameters !== undefined) {
      for (let item of this.parameters.entries()) {
        yield item
      }
    }
  }

  public addMiddleware(m: Middleware) {
    if (this.middlewares === undefined) {
      this.middlewares = []
    }
    this.middlewares.push(m)
  }

  public * valuesOfMiddlewares(): Iterable<Middleware> {
    if (this.middlewares !== undefined) {
      for (let m of this.middlewares) {
        yield m
      }
    }
  }
}

export class AutoMethodPayload {
  private responseStatus: HttpStatus = 200

  public setResponseStatus(responseStatus: HttpStatus) {
    this.responseStatus = responseStatus
  }

  public getResponseStatus(): HttpStatus {
    return this.responseStatus
  }
}

export type AutoMethodPropertiesContainer = Map<AutoMethod, AutoMethodProperties>
export type AutoMethodPayloadContainer = Map<AutoMethod, AutoMethodPayload>