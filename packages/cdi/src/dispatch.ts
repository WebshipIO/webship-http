import {Scope} from './scope'
import {Dependency, DependencyContainer} from './dependency'
import {Provider, ProviderInstance, ProviderKey, ProviderContainer} from './provider'
import {Node, NodeInstance, NodeInstanceContainer} from './node'
import {TreeNode} from './tree'
import {ApplicationContext, SessionContext, RequestContext} from './context'

export class NodeDispatcher {
  public static create(providerContainer: ProviderContainer, dependencyContainer: DependencyContainer): NodeDispatcher {
    return new NodeDispatcher(providerContainer, dependencyContainer)
  }

  private context: ApplicationContext

  constructor(
    private providerContainer: ProviderContainer, 
    private dependencyContainer: DependencyContainer
  ) {
  }

  public check() {
    // (1) scope.provider-key 是否存在
    let warns = []
    for (let [node, propertyKey, dependency] of this.dependencyContainer.entries()) {
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

  public async createApplicationContext(): Promise<ApplicationContext> {
    this.context = new TreeNode()
    this.context.value = Object.create(null)
    this.context.value.providerContainer = new Map()
    this.context.value.nodeContainer = new NodeInstanceContainer()
    let providerInstanceContainer = this.context.value.providerContainer
    for (let [key, provider] of this.providerContainer.entries(Scope.APPLICATION)) {
      let instance = provider(this.context)
      providerInstanceContainer.set(key, instance)
      if (typeof (instance as any).onCreate === 'function') {
        await (instance as any).onCreate()
      }
    }
    return this.context
  }

  public async createNodeOfApplicationContext<T>(node: Node<T>): Promise<T> {
    let instance = Reflect.construct(node, this.genArgumentsOfApplicationContext(node, 'constructor'))
    this.context.value.nodeContainer.add(node, instance)
    if (typeof (instance as any).onCreate === 'function') {
      await (instance as any).onCreate()
    }
    return instance
  }

  public async destroyApplicationContext() {
    for (let session of this.context.valuesOfChildren()) {
      await this.destroySessionContext(session)
    }
    for (let instance of this.context.value.nodeContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    for (let instance of this.context.value.providerContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    this.context.clearChildren()
    this.context.value.nodeContainer.clear()
    this.context.value.providerContainer.clear()
  }

  public async createSessionContext(): Promise<SessionContext> {
    let session = this.context.addChild()
    session.value = Object.create(null)
    session.value.providerContainer = new Map()
    session.value.nodeContainer = new NodeInstanceContainer()
    let providerInstanceContainer = session.value.providerContainer
    for (let [key, provider] of this.providerContainer.entries(Scope.SESSION)) {
      let instance = provider(session)
      providerInstanceContainer.set(key, instance)
      if (typeof (instance as any).onCreate === 'function') {
        await (instance as any).onCreate()
      }
    }
    return session
  }

  public async createNodeOfSessionContext<T>(node: Node<T>, session: SessionContext): Promise<T> {
    // 创建一个节点实例，并保存在 Node Instance Context 的请求环境；同时，配置节点实例
    let instance = Reflect.construct(node, this.genArgumentsOfSessionContext(node, 'constructor', session))
    session.value.nodeContainer.add(node, instance)
    if (typeof (instance as any).onCreate === 'function') {
      await (instance as any).onCreate()
    }
    return instance
  }

  public async destroySessionContext(session: SessionContext) {
    for (let request of session.valuesOfChildren()) {
      await this.destroyRequestContext(request)
    }
    for (let instance of session.value.nodeContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    for (let instance of session.value.providerContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    session.getParent().deleteChild(session)
  }

  public async createRequestContext(session: SessionContext): Promise<RequestContext> {
    let request = session.addChild()
    request.value = Object.create(null)
    request.value.providerContainer = new Map()
    request.value.nodeContainer = new NodeInstanceContainer()
    let providerInstanceContainer = request.value.providerContainer
    for (let [key, provider] of this.providerContainer.entries(Scope.REQUEST)) {
      let instance = provider(request)
      providerInstanceContainer.set(key, instance)
      if (typeof (instance as any).onCreate === 'function') {
        await (instance as any).onCreate()
      }
    }
    return request
  }

  public async createNodeOfRequestContext<T>(node: Node<T>, request: RequestContext): Promise<T> {
    // 创建一个节点实例，并保存在 Node Instance Context 的请求环境；同时，配置节点实例
    let instance = Reflect.construct(node, this.genArgumentsOfRequestContext(node, 'constructor', request))
    request.value.nodeContainer.add(node, instance)
    if (typeof (instance as any).onCreate === 'function') {
      await (instance as any).onCreate()
    }
    return instance
  }

  public async destroyRequestContext(request: RequestContext) {
    for (let instance of request.value.nodeContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    for (let instance of request.value.providerContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        await (instance as any).onDestroy()
      }
    }
    request.getParent().deleteChild(request)
  } 

  public genArgumentsOfApplicationContext<T>(node: Node<T>, propertyKey: PropertyKey): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey)
        break
      case Scope.SESSION:
      case Scope.REQUEST:
        break
      }
    }
    return args
  }

  public genArgumentsOfSessionContext<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionContext): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey)
        break
      case Scope.SESSION:
        args[dependency.parameterIndex] = session.value.providerContainer.get(dependency.providerKey)
        break
      case Scope.REQUEST:
        break
      }
    }
    return args
  }

  public genArgumentsOfRequestContext<T>(node: Node<T>, propertyKey: PropertyKey, request: RequestContext): Array<any> {
    // 生成节点属性的依赖参数
    let args: Array<ProviderInstance> = []
    for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
      switch (dependency.scope) {
      case Scope.APPLICATION:
        args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey)
        break
      case Scope.SESSION:
        args[dependency.parameterIndex] = request.getParent().value.providerContainer.get(dependency.providerKey)
        break
      case Scope.REQUEST:
        args[dependency.parameterIndex] = request.value.providerContainer.get(dependency.providerKey)
        break
      }
    }
    return args
  }

  public applyOfApplicationContext(instance: NodeInstance, propertyKey: PropertyKey): any {
    let args = this.genArgumentsOfApplicationContext(instance.constructor as Node, propertyKey)
    return Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }

  public applyOfSessionContext(instance: NodeInstance, propertyKey: PropertyKey, session: SessionContext): any {
    let args = this.genArgumentsOfSessionContext(instance.constructor as Node, propertyKey, session)
    return Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }

  public applyOfRequestContext(instance: NodeInstance, propertyKey: PropertyKey, request: RequestContext): any {
    let args = this.genArgumentsOfRequestContext(instance.constructor as Node, propertyKey, request)
    return Reflect.apply(Reflect.get(instance, propertyKey), instance, args)
  }
}

