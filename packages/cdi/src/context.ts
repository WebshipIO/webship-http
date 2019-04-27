import {Scope, SessionIdentifier, RequestIdentifier} from './scope'
import {Provider, ProviderInstance, ProviderKey, ProviderInstanceContainer} from './provider'
import {Node, NodeInstance, NodeInstanceContainer} from './node'

export class Context {
  public readonly providerInstanceContainer: ProviderInstanceContainer = new Map()
  public readonly nodeInstanceContainer: NodeInstanceContainer = new NodeInstanceContainer()
}

export class RequestContext extends Context {
}

export class SessionContext extends Context {
  public readonly requests: Map<RequestIdentifier, RequestContext> = new Map()
}

export class ApplicationContext extends Context {
  private static sInstance: ApplicationContext

  public static get instance(): ApplicationContext {
    if (ApplicationContext.sInstance === undefined) {
      ApplicationContext.sInstance = new ApplicationContext()
    }
    return ApplicationContext.sInstance
  }

  private readonly sessions: Map<SessionIdentifier, SessionContext> = new Map()

  public createSessionContext(session: SessionIdentifier) {
    this.sessions.set(session, new SessionContext())
  }

  public createRequestContext(session: SessionIdentifier, request: RequestIdentifier) {
    this.sessions.get(session).requests.set(request, new RequestContext())
  }

  public clearApplicationContext() {
    this.nodeInstanceContainer.clear()
    this.providerInstanceContainer.clear()
    this.sessions.clear()
  }

  public deleteSessionContext(session: SessionIdentifier) {
    this.sessions.delete(session)
  }

  public deleteRequestContext(session: SessionIdentifier, request: RequestIdentifier) {
    this.sessions.get(session).requests.delete(request)
  }

  public hasSessionContext(session: SessionIdentifier): boolean {
    return this.sessions.has(session)
  }

  public hasRequestContext(session: SessionIdentifier, request: RequestIdentifier): boolean {
    return this.sessions.has(session) && this.sessions.get(session).requests.has(request)
  }

  public getProviderInstanceContainerOfApplicationLocal(): ProviderInstanceContainer {
    return this.providerInstanceContainer
  }

  public getNodeInstanceContainerOfApplicationLocal(): NodeInstanceContainer {
    return this.nodeInstanceContainer
  }

  public getProviderInstanceContainerOfSessionLocal(session: SessionIdentifier): ProviderInstanceContainer {
    return this.sessions.get(session).providerInstanceContainer
  }

  public getNodeInstanceContainerOfSessionLocal(session: SessionIdentifier): NodeInstanceContainer {
    return this.sessions.get(session).nodeInstanceContainer
  }

  public getProviderInstanceContainerOfRequestLocal(session: SessionIdentifier, request: RequestIdentifier): ProviderInstanceContainer {
    return this.sessions.get(session).requests.get(request).providerInstanceContainer
  }

  public getNodeInstanceContainerOfRequestLocal(session: SessionIdentifier, request: RequestIdentifier): NodeInstanceContainer {
    return this.sessions.get(session).requests.get(request).nodeInstanceContainer
  }

  public * providerInstancesOfApplicationContext(): Iterable<ProviderInstance> {
    for (let session of this.sessions.values()) {
      for (let request of session.requests.values()) {
        for (let instance of request.providerInstanceContainer.values()) {
          yield instance
        }
      }
      for (let instance of session.providerInstanceContainer.values()) {
        yield instance
      }
    }
    for (let instance of this.providerInstanceContainer.values()) {
      yield instance
    }
  }

  public * nodeInstancesOfApplicationContext(): Iterable<ProviderInstance> {
    for (let session of this.sessions.values()) {
      for (let request of session.requests.values()) {
        for (let instance of request.nodeInstanceContainer.values()) {
          yield instance
        }
      }
      for (let instance of session.nodeInstanceContainer.values()) {
        yield instance
      }
    }
    for (let instance of this.nodeInstanceContainer.values()) {
      yield instance
    }
  }

  public * providerInstancesOfSessionContext(session: SessionIdentifier): Iterable<ProviderInstance> {
    let context = this.sessions.get(session)
    for (let request of context.requests.values()) {
      for (let instance of request.providerInstanceContainer.values()) {
        yield instance
      }
    }
    for (let instance of context.providerInstanceContainer.values()) {
      yield instance
    }
  }

  public * nodeInstancesOfSessionContext(session: SessionIdentifier): Iterable<NodeInstance> {
    let context = this.sessions.get(session)
    for (let request of context.requests.values()) {
      for (let instance of request.nodeInstanceContainer.values()) {
        yield instance
      }
    }
    for (let instance of context.nodeInstanceContainer.values()) {
      yield instance
    }
  }

  public * providerInstancesOfRequestContext(session: SessionIdentifier, request: RequestIdentifier): Iterable<ProviderInstance> {
    for (let instance of this.sessions.get(session).requests.get(request).providerInstanceContainer.values()) {
      yield instance
    }
  }

  public * nodeInstancesOfRequestContext(session: SessionIdentifier, request: RequestIdentifier): Iterable<NodeInstance> {
    for (let instance of this.sessions.get(session).requests.get(request).nodeInstanceContainer.values()) {
      yield instance
    }
  }
}