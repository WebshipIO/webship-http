import {Node, NodeDispatcher} from '@webnode/cdi'
import {HttpMethod, RePathname, RePathnameParams} from './request'
import {HttpStatus} from './response'
import {AutoMethod, AutoMethodProperties, AutoMethodPayload, ParameterPoint} from './automethod'
import {AutoMethodPropertiesContainer, AutoMethodPayloadContainer} from './automethod'
import {Event, EventContainer} from './event'
import {Route, RouteContainer} from './route'

export class Registry {
  private static sInstance: Registry

  public static get instance(): Registry {
    if (Registry.sInstance === undefined) {
      Registry.sInstance = new Registry()
    }
    return Registry.sInstance
  }

  private readonly autoMethodPropertiesContainer: AutoMethodPropertiesContainer = new Map()
  private readonly autoMethodPayloadContainer: AutoMethodPayloadContainer = new Map()
  
  private readonly routeContainer: RouteContainer = new Map()
  private readonly eventContainer: EventContainer = new Map()

  private readonly routeNodeSet: Set<Node> = new Set()
  private readonly eventNodeSet: Set<Node> = new Set()

  public * valuesOfEventAutoMethods(event: Event): Iterable<AutoMethod> {
    if (this.eventContainer.has(event)) {
      let value = this.eventContainer.get(event)
      if (value instanceof Array) {
        for (let item of value) {
          yield item
        }
      } else {
        yield value
      }
    }
  }

  public * valuesOfEventNodes(): Iterable<Node> {
    for (let node of this.eventNodeSet) {
      yield node
    }
  }

  public * valuesOfRouteNodes(): Iterable<Node> {
    for (let node of this.routeNodeSet) {
      yield node
    }
  }

  public getRoute(method: HttpMethod, pathname: string): [Route, RePathnameParams] {
    if (!this.routeContainer.has(method)) {
      return [null, null]
    } 
    for (let [rePathname, route] of this.routeContainer.get(method).entries()) {
      if (route.isActive()) {
        let pathnameRegExp = route.getRequestPathnameRegExp()
        let input = pathnameRegExp.re.exec(pathname)
        if (input !== null) {
          for (let autoMethod of route.valuesOfAutoMethods()) {
            let node = this.autoMethodPropertiesContainer.get(autoMethod).getNode()
            let params: RePathnameParams = Object.create(null)
            for (let [i, key] of pathnameRegExp.keys.entries()) {
              params[key.name] = input[i+1]
            }
            return [route, params]
          }
        }
      }
    }
    return [null, null]
  }

  public getAutoMethodProperties(autoMethod: AutoMethod): AutoMethodProperties {
    return this.autoMethodPropertiesContainer.get(autoMethod)
  }

  public getAutoMethodPayload(autoMethod: AutoMethod): AutoMethodPayload {
    return this.autoMethodPayloadContainer.get(autoMethod)
  }

  public hasAutoMethodProperties(autoMethod: AutoMethod): boolean {
    return this.autoMethodPropertiesContainer.has(autoMethod)
  }

  public hasAutoMethodPayload(autoMethod: AutoMethod): boolean {
    return this.autoMethodPayloadContainer.has(autoMethod)
  }

  public registerParameter(node: Node, autoMethod: AutoMethod, parameterIndex: number, point: ParameterPoint) {
    if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
      this.autoMethodPropertiesContainer.set(autoMethod, new AutoMethodProperties(node))
    }
    this.autoMethodPropertiesContainer.get(autoMethod).setParameter(parameterIndex, point)
  }

  public registerResponseStatus(node: Node, autoMethod: AutoMethod, status: HttpStatus) {
    if (!this.autoMethodPayloadContainer.has(autoMethod)) {
      this.autoMethodPayloadContainer.set(autoMethod, new AutoMethodPayload())
    }
    this.autoMethodPayloadContainer.get(autoMethod).setResponseStatus(status)
  }

  public registerMiddleware(node: Node, autoMethod: AutoMethod) {
    if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
      this.autoMethodPropertiesContainer.set(autoMethod, new AutoMethodProperties(node))
    }
    this.autoMethodPropertiesContainer.get(autoMethod).addMiddleware(autoMethod)
  }

  public registerRoute(node: Node, autoMethod: AutoMethod, method: HttpMethod, rePathname: RePathname) {
    if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
      this.autoMethodPropertiesContainer.set(autoMethod, new AutoMethodProperties(node))
    }
    if (!this.routeContainer.has(method)) {
      this.routeContainer.set(method, new Map())
    }
    let methods = this.routeContainer.get(method)
    if (!methods.has(rePathname)) {
      methods.set(rePathname, new Route(method, rePathname))
    }
    methods.get(rePathname).addAutoMethod(autoMethod)
  }

  public registerEvent(node: Node, autoMethod: AutoMethod, event: Event) {
    if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
      this.autoMethodPropertiesContainer.set(autoMethod, new AutoMethodProperties(node))
    }
    if (this.eventContainer.has(event)) {
      let tmp = this.eventContainer.get(event)
      if (tmp instanceof Array) {
        tmp.push(autoMethod)
      } else {
        this.eventContainer.set(event, [tmp, autoMethod])
      }
    } else {
      this.eventContainer.set(event, autoMethod)
    }
  }

  public registerRouteNode(node: Node) {
    this.routeNodeSet.add(node)
  }

  public registerEventNode(node: Node) {
    this.eventNodeSet.add(node)
  }
}


