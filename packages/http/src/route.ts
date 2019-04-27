import * as PathToRegexp from "path-to-regexp"
import {HttpMethod, RePathname, RePathnameParams} from './request'
import {AutoMethod} from './automethod'

export class PathnameRegExp {
  public readonly keys: Array<PathToRegexp.Key>
  public readonly rePathname: string
  public readonly re: RegExp

  constructor(rePathname: RePathname) {
    this.keys = []
    this.rePathname = rePathname
    this.re = PathToRegexp(this.rePathname, this.keys)
  }
}

export class Route {       
  private autoMethods: AutoMethod | Array<AutoMethod>
  private requestPathnameRegExp: PathnameRegExp 
  private active: boolean = true

  constructor(
    private requestMethod: HttpMethod,
    private requestRePathname: RePathname 
  ) {
    this.requestPathnameRegExp = new PathnameRegExp(requestRePathname)
  }

  public setActive(active: boolean) {
    this.active = active
  }

  public isActive(): boolean {
    return this.active
  }

  public addAutoMethod(autoMethod: AutoMethod) {
    if (this.autoMethods instanceof Array) {
      this.autoMethods.push(autoMethod)
    } else if (this.autoMethods === undefined) {
      this.autoMethods = autoMethod
    } else {
      let tmp = this.autoMethods
      this.autoMethods = [tmp]
      this.autoMethods.push(autoMethod)
    }
  }

  public *valuesOfAutoMethods(): Iterable<AutoMethod> {
    if (this.autoMethods instanceof Array) {
      for (let autoMethod of this.autoMethods) {
        yield autoMethod
      }
    } else if (this.autoMethods === undefined) {
    } else {
      yield this.autoMethods as AutoMethod
    }
  }

  public getRequestMethod(): HttpMethod {
    return this.requestMethod
  }

  public getRequestRePathname(): RePathname {
    return this.requestRePathname
  }

  public getRequestPathnameRegExp(): PathnameRegExp {
    return this.requestPathnameRegExp
  }
}

export type RouteContainer = Map<HttpMethod, Map<RePathname, Route>>