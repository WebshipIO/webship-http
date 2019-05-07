import {Scope, SessionIdentifier, RequestIdentifier} from './scope'
import {Dependency, DependencyContainer} from './dependency'
import {Provider, ProviderInstance, ProviderKey, ProviderContainer} from './provider'
import {Node, NodeInstance} from './node'
import {ApplicationContext} from './context'

export class NodeDispatcher {
  public static create(
    providerContainer: ProviderContainer, 
    dependencyContainer: DependencyContainer,
    context: ApplicationContext
  ): NodeDispatcher {
    return new NodeDispatcher(
      providerContainer, 
      dependencyContainer, 
      context
    )
  }

  constructor(
    private providerContainer: ProviderContainer, 
    private dependencyContainer: DependencyContainer,
    private context: ApplicationContext
  ) {
  }

  public check() {
    // (1) scope.provider-key 是否存在
    let warns = []
    for (let [node, propertyKey, dependency] of this.dependencyContainer.entriesOfDependencies()) {
      if (!this.providerContainer.has(dependency.scope, dependency.providerKey)) {
        warns.push({
          node: node,
          propertyKey: propertyKey,
          parameterIndex: dependency.parameterIndex,
          providerKey: dependency.providerKey,
          providerType: dependency.providerType,
          scope: dependency.scope
        })
      }
    }
    for (let warn of warns) {
      console.warn(`provider not found: (node:'${warn.node.name}', propertyKey:'${warn.propertyKey.toString()}', ` +
                   `parameterIndex:${warn.parameterIndex}, providerKey:'${warn.providerKey.toString()}', ` +
                   `providerType:'${warn.providerType}', scope:${warn.scope})`)
    }
  } 

  public genArgumentsOnApplicationLocal<T>(node: Node<T>, propertyKey: PropertyKey): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey)
        break
      case Scope.SESSION:
      case Scope.REQUEST:
        break
      }
    }
    return args
  }

  public genArgumentsOnSessionLocal<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionIdentifier): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey)
        break
      case Scope.SESSION:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfSessionLocal(session).get(dependency.providerKey)
        break
      case Scope.REQUEST:
        break
      }
    }
    return args
  }

  public genArgumentsOnRequestLocal<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionIdentifier, request: RequestIdentifier): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey)
        break
      case Scope.SESSION:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfSessionLocal(session).get(dependency.providerKey)
        break
      case Scope.REQUEST:
        args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfRequestLocal(session, request).get(dependency.providerKey)
        break
      }
    }
    return args
  }

  public applyOnApplicationLocal(instance: NodeInstance, propertyKey: PropertyKey) {
    let args = this.genArgumentsOnApplicationLocal(instance.constructor as Node, propertyKey)
    Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }

  public applyOnSessionLocal(instance: NodeInstance, propertyKey: PropertyKey, session: SessionIdentifier) {
    let args = this.genArgumentsOnSessionLocal(instance.constructor as Node, propertyKey, session)
    Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }

  public applyOnRequestLocal(instance: NodeInstance, propertyKey: PropertyKey, session: SessionIdentifier, request: RequestIdentifier) {
    let args = this.genArgumentsOnRequestLocal(instance.constructor as Node, propertyKey, session, request)
    Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }

  public createApplicationContext() {
    // 创建应用程序环境，此时，所有属于 Application Scope 的 Provider 实例都被创建
    let providerInstanceContainer = this.context.getProviderInstanceContainerOfApplicationLocal()
    for (let [key, provider] of this.providerContainer.entries(Scope.APPLICATION)) {
      providerInstanceContainer.set(key, provider(this.context))
    }
  }

  public destroyApplicationContext() {
    // 销毁应用程序环境，所有相关的节点实例、节点实例配置、Provider 实例都被销毁
    for (let instance of this.context.nodeInstancesOfApplicationContext()) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    for (let instance of this.context.providerInstancesOfApplicationContext()) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    this.context.clearApplicationContext()
  }

  public createInstanceOnApplicationLocal<T>(node: Node<T>): T {
    // 创建一个节点实例，并保存在 Node Instance Context 的应用程序环境；同时，配置节点实例
    let instance = Reflect.construct(node, this.genArgumentsOnApplicationLocal(node, 'constructor'))
    this.context.getNodeInstanceContainerOfApplicationLocal().add(node, instance)
    return instance
  }

  public getInstanceOnApplicationLocal<T>(node: Node<T>): T | Set<T> {
    return this.context.getNodeInstanceContainerOfApplicationLocal().get(node)
  }

  public createSessionContext(): SessionIdentifier {
    // 创建一个会话环境，准备 Provider Instance Context 和 Node Instance Context；
    // 同时，所有属于 Session Scope 的 Provider 实例都被创建
    let session = Symbol('session')
    this.context.createSessionContext(session)
    for (let [key, provider] of this.providerContainer.entries(Scope.SESSION)) {
      this.context.getProviderInstanceContainerOfSessionLocal(session).set(key, provider(this.context, session))
    }
    return session
  }

  public destroySessionContext(session: SessionIdentifier) {
    // 销毁一个会话环境，所有相关的节点实例、节点实例配置、Provider 实例都被销毁
    for (let instance of this.context.nodeInstancesOfSessionContext(session)) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    for (let instance of this.context.providerInstancesOfSessionContext(session)) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    this.context.deleteSessionContext(session)
  }

  public createInstanceOnSessionLocal<T>(node: Node<T>, session: SessionIdentifier): T {
    // 创建一个节点实例，并保存在 Node Instance Context 的会话环境；同时，配置节点实例
    let instance = Reflect.construct(node, this.genArgumentsOnSessionLocal(node, 'constructor', session))
    this.context.getNodeInstanceContainerOfSessionLocal(session).add(node, instance)
    return instance
  }

  public getInstanceOnSessionLocal<T>(node: Node<T>, session: SessionIdentifier): T | Set<T> {
    return this.context.getNodeInstanceContainerOfSessionLocal(session).get(node)
  }

  public createRequestContext(session: SessionIdentifier): RequestIdentifier {
    // 创建一个请求环境，准备 Provider Instance Context 和 Node Instance Context，
    // 同时，所有属于 Request Scope 的 Provider 实例都被创建
    let request = Symbol('request')
    this.context.createRequestContext(session, request)
    for (let [key, provider] of this.providerContainer.entries(Scope.SESSION)) {
      this.context.getProviderInstanceContainerOfRequestLocal(session, request).set(key, provider(this.context, session, request))
    }
    return request
  }

  public destroyRequestContext(session: SessionIdentifier, request: RequestIdentifier) {
    // 销毁一个请求环境，所有相关的节点实例、节点实例配置、Provider 实例都被销毁
    for (let instance of this.context.nodeInstancesOfRequestContext(session, request)) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    for (let instance of this.context.providerInstancesOfRequestContext(session, request)) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    this.context.deleteRequestContext(session, request)
  } 

  public createInstanceOnRequestLocal<T>(node: Node<T>, session: SessionIdentifier, request: RequestIdentifier): T {
    // 创建一个节点实例，并保存在 Node Instance Context 的请求环境；同时，配置节点实例
    let instance = Reflect.construct(node, this.genArgumentsOnRequestLocal(node, 'constructor', session, request))
    this.context.getNodeInstanceContainerOfRequestLocal(session, request).add(node, instance)
    return instance
  }

  public getInstanceOnRequestLocal<T>(node: Node<T>, session: SessionIdentifier, request: RequestIdentifier): T | Set<T> {
    return this.context.getNodeInstanceContainerOfRequestLocal(session, request).get(node)
  }
}



