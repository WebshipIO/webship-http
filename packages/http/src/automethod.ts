import {ClassType, Node} from '@webnode/cdi'
import {HttpStatus} from './response'

export enum ParameterPoint {
  REQUEST, 
  RESPONSE, 
  REQUEST_URI, REQUEST_QUERY, REQUEST_HEADERS, REQUEST_PARAMS, REQUEST_BODY, 
  ERROR
}

export type AutoMethod = (...args: Array<any>) => void | Promise<void>

export class AutoMethodProperties {
  private parameters: Map<number, ParameterPoint>
  private middlewares?: Array<AutoMethod>

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

  public addMiddleware(m: AutoMethod) {
    if (this.middlewares === undefined) {
      this.middlewares = []
    }
    this.middlewares.push(m)
  }

  public * valuesOfMiddlewares(): Iterable<AutoMethod> {
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