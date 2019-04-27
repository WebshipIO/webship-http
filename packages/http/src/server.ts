/*

             Http.Server
                  |
      'connection' 'request' --- 'close', ...
                  |
               Executor
           /              \
   SessionExecutor   RequestExecutor
          |                |
     Controller      ControllerMethod
          |                |
           \              /
            |            |
            +------------+
                  |
         Controller Dispatcher

*/

import {Socket, AddressInfo} from 'net'
import {IncomingMessage, ServerResponse, Server, createServer} from 'http'
import {Scope, ProviderKey, Provider, ProviderInstance, ProviderContainer, DependencyContainer, NodeDispatcher} from '@webnode/cdi'
import {ApplicationContext, SessionIdentifier, RequestIdentifier} from '@webnode/cdi'
import {HttpError} from './error'
import {ServerConfig} from './config'
import {Registry} from './registry'
import {RequestExecutor} from './executor'

export class HttpServer {
  public static create(config?: ServerConfig): HttpServer {
    return new HttpServer(config)
  }

  private context = new ApplicationContext()
  private nodeDispatcher: NodeDispatcher = new NodeDispatcher(
      ProviderContainer.instance, DependencyContainer.instance, this.context)
  private config: ServerConfig
  private server: Server = createServer()
  private closed: boolean = true

  constructor(config?: ServerConfig) {
    if (typeof config !== 'object' || config === null) {
      config = Object.create(null)
    }
    this.config = config
  }

  public registerProvider(scope: Scope, key: ProviderKey, provider: Provider) {
    ProviderContainer.instance.set(scope, key, provider)
  }

  public unregisterProvider(scope: Scope, key: ProviderKey) {
    ProviderContainer.instance.delete(scope, key)
  }

  public getApplicationScopeProviderInstance(key: ProviderKey): ProviderInstance {
    return this.context.getProviderInstanceContainerOfApplicationLocal().get(key)
  }

  public hasApplicationScopeProviderInstance(key: ProviderKey): boolean {
    return this.context.getProviderInstanceContainerOfApplicationLocal().has(key)
  }

  public getSessionScopeProviderInstance(key: ProviderKey, sessionIdent: SessionIdentifier): ProviderInstance {
    return this.context.getProviderInstanceContainerOfSessionLocal(sessionIdent).get(key)
  }

  public hasSessionScopeProviderInstance(key: ProviderKey, sessionIdent: SessionIdentifier): ProviderInstance {
    return this.context.getProviderInstanceContainerOfSessionLocal(sessionIdent).has(key)
  }

  public getRequestScopeProviderInstance(key: ProviderKey, sessionIdent: SessionIdentifier, requestIdent: RequestIdentifier): ProviderInstance {
    return this.context.getProviderInstanceContainerOfRequestLocal(sessionIdent, requestIdent).get(key)
  }

  public hasRequestScopeProviderInstance(key: ProviderKey, sessionIdent: SessionIdentifier, requestIdent: RequestIdentifier): ProviderInstance {
    return this.context.getProviderInstanceContainerOfRequestLocal(sessionIdent, requestIdent).has(key)
  }

  public async serve() {
    let hostname = '127.0.0.1'
    let port = 0
    if (typeof this.config.hostname === 'string') {
      hostname = this.config.hostname
    }
    if (typeof this.config.port === 'number') {
      port = this.config.port
    }
    if (typeof this.config.keepAliveTimeout === 'number') {
      this.server.keepAliveTimeout = this.config.keepAliveTimeout
    }
    if (typeof this.config.timeout === 'number') {
      this.server.timeout = this.config.timeout
    }
    this.server.on('connection', (connection) => this.prepareSessionContext(connection))
    this.server.on('request', (req, res) => new RequestExecutor(req, res, this.nodeDispatcher, Registry.instance, this.config).exec())
    this.server.on('close', () => this.closed = true)
    this.prepareApplicationContext()
    await new Promise((complete, fail) => this.server.listen(port, hostname, complete))
    this.closed = false
  }

  public async close() {
    await new Promise((complete, fail) => this.server.close(complete))
  }

  public address(): AddressInfo {
    return this.server.address() as AddressInfo
  }

  private prepareApplicationContext() {
    this.nodeDispatcher.createApplicationContext()
    for (let node of Registry.instance.valuesOfEventNodes()) {
      this.nodeDispatcher.createInstanceOnApplicationLocal(node) 
    }
  }

  private prepareSessionContext(connection: Socket) {
    let session = this.nodeDispatcher.createSessionContext()
    for (let node of Registry.instance.valuesOfRouteNodes()) {
      this.nodeDispatcher.createInstanceOnSessionLocal(node, session) // Controller Node Instance 一定只有一个
    }
    (connection as any).__session__ = session
    connection.on('close', () => this.nodeDispatcher.destroySessionContext(session))
  }
}

