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
import {ApplicationContext, SessionContext, RequestContext} from '@webnode/cdi'
import {HttpError} from './error'
import {ServerConfig} from './config'
import {Registry} from './registry'
import {RequestExecutor} from './executor'

export class HttpServer {
  public static create(config?: ServerConfig): HttpServer {
    return new HttpServer(config)
  }

  private nodeDispatcher: NodeDispatcher = new NodeDispatcher(ProviderContainer.instance, DependencyContainer.instance)
  private server: Server = createServer()
  private closed: boolean = true
  private connectionCount: number = 0
  private config: ServerConfig
  private context: ApplicationContext

  constructor(config?: ServerConfig) {
    if (typeof config !== 'object' || config === null) {
      config = Object.create(null)
    }
    this.config = config
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
    await this.prepareApplicationContext()
    await new Promise((complete, fail) => this.server.listen(port, hostname, complete))
    this.closed = false
  }

  public async close() {
    if (!this.closed) {
      await new Promise((complete, fail) => this.server.close(complete))
      this.closed = true
      if (this.connectionCount === 0) {
        await this.nodeDispatcher.destroyApplicationContext()
      }
    }
  }

  public address(): AddressInfo {
    return this.server.address() as AddressInfo
  }

  private async prepareApplicationContext() {
    this.context = await this.nodeDispatcher.createApplicationContext()
    for (let node of Registry.instance.valuesOfEventNodes()) {
      await this.nodeDispatcher.createNodeOfApplicationContext(node) 
    }
  }

  private async prepareSessionContext(connection: Socket) {
    let session = await this.nodeDispatcher.createSessionContext()
    for (let node of Registry.instance.valuesOfRouteNodes()) {
      await this.nodeDispatcher.createNodeOfSessionContext(node, session) // Controller Node Instance 一定只有一个
    }
    (connection as any).__webnode_http_session__ = session
    connection.on('close', async () => {
      await this.nodeDispatcher.destroySessionContext(session)
      this.connectionCount--
      if (this.closed) {
        await this.nodeDispatcher.destroyApplicationContext()
      }
    })
    this.connectionCount++
  }
}

