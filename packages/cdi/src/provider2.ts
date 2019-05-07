/*
  这个模块说明依赖的 Provider。为了保证依赖元素在运行时的可用性，
  Provider 必须首先是一个 Object，即根对象。假如 Provider 不是一个
  Object，而是，比如一个 number，那么这样的数据更像是一个配置值，这
  样的数据在环境共享的时候没有太多的用处。对于配置值，更好的办法是提供
  一个 Config Provider，并且把所需要的配置值放置在 Config 对象当中，
  这样可以提供更大的灵活性和实用性。

  同样的，对于 undefined、null 都没有任何实用性。
*/

import {Scope, SessionIdentifier, RequestIdentifier} from './scope'
import {ApplicationContext, SessionContext, RequestContext} from './context2'

export type Provider = (application: ApplicationContext, session?: SessionContext, request?: RequestContext) => ProviderInstance | Promise<ProviderInstance>
export type ProviderInstance = NonNullable<Object>
export type ProviderKey = PropertyKey
export type ProviderMap = Map<ProviderKey, Provider>
export type ProviderInstanceContainer = Map<ProviderKey, ProviderInstance>

export class ProviderContainer {
  private static sInstance: ProviderContainer

  public static get instance(): ProviderContainer {
    if (ProviderContainer.sInstance === undefined) {
      ProviderContainer.sInstance = new ProviderContainer()
    }
    return ProviderContainer.sInstance
  }
  
  private applicationMap: ProviderMap = new Map()
  private sessionMap: ProviderMap = new Map()
  private requestMap: ProviderMap = new Map()

  public set(scope: Scope, key: ProviderKey, provider: Provider) {
    this.getScopeMap(scope).set(key, provider)
  }

  public has(scope: Scope, key: ProviderKey): boolean {
    return this.getScopeMap(scope).has(key)
  }

  public get(scope: Scope, key: ProviderKey): Provider {
    return this.getScopeMap(scope).get(key)
  }

  public delete(scope: Scope, key: ProviderKey) {
    this.getScopeMap(scope).delete(key)
  }

  public clear() {
    this.applicationMap.clear()
    this.sessionMap.clear()
    this.requestMap.clear()
  }

  public size(scope: Scope): number {
    return this.getScopeMap(scope).size
  }

  public * values(scope: Scope): Iterable<Provider> {
    for (let item of this.getScopeMap(scope).values()) {
      yield item
    }
  }

  public * entries(scope: Scope): Iterable<[ProviderKey, Provider]> {
    for (let item of this.getScopeMap(scope).entries()) {
      yield item
    }
  }

  private getScopeMap(scope: Scope): ProviderMap {
    switch (scope) {
    case Scope.APPLICATION:
      return this.applicationMap
    case Scope.SESSION:
      return this.sessionMap
    case Scope.REQUEST:
      return this.requestMap
    default: 
      throw new Error('bad scope' + String(scope))
    }
  }
}




