"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const cdi_1 = require("@webnode/cdi");
const cdi_2 = require("@webnode/cdi");
const registry_1 = require("./registry");
const executor_1 = require("./executor");
class HttpServer {
    constructor(config) {
        this.context = new cdi_2.ApplicationContext();
        this.nodeDispatcher = new cdi_1.NodeDispatcher(cdi_1.ProviderContainer.instance, cdi_1.DependencyContainer.instance, this.context);
        this.server = http_1.createServer();
        this.closed = true;
        this.connectionCount = 0;
        if (typeof config !== 'object' || config === null) {
            config = Object.create(null);
        }
        this.config = config;
    }
    static create(config) {
        return new HttpServer(config);
    }
    registerProvider(scope, key, provider) {
        cdi_1.ProviderContainer.instance.set(scope, key, provider);
    }
    unregisterProvider(scope, key) {
        cdi_1.ProviderContainer.instance.delete(scope, key);
    }
    getApplicationScopeProviderInstance(key) {
        return this.context.getProviderInstanceContainerOfApplicationLocal().get(key);
    }
    hasApplicationScopeProviderInstance(key) {
        return this.context.getProviderInstanceContainerOfApplicationLocal().has(key);
    }
    getSessionScopeProviderInstance(key, sessionIdent) {
        return this.context.getProviderInstanceContainerOfSessionLocal(sessionIdent).get(key);
    }
    hasSessionScopeProviderInstance(key, sessionIdent) {
        return this.context.getProviderInstanceContainerOfSessionLocal(sessionIdent).has(key);
    }
    getRequestScopeProviderInstance(key, sessionIdent, requestIdent) {
        return this.context.getProviderInstanceContainerOfRequestLocal(sessionIdent, requestIdent).get(key);
    }
    hasRequestScopeProviderInstance(key, sessionIdent, requestIdent) {
        return this.context.getProviderInstanceContainerOfRequestLocal(sessionIdent, requestIdent).has(key);
    }
    serve() {
        return __awaiter(this, void 0, void 0, function* () {
            let hostname = '127.0.0.1';
            let port = 0;
            if (typeof this.config.hostname === 'string') {
                hostname = this.config.hostname;
            }
            if (typeof this.config.port === 'number') {
                port = this.config.port;
            }
            if (typeof this.config.keepAliveTimeout === 'number') {
                this.server.keepAliveTimeout = this.config.keepAliveTimeout;
            }
            if (typeof this.config.timeout === 'number') {
                this.server.timeout = this.config.timeout;
            }
            this.server.on('connection', (connection) => this.prepareSessionContext(connection));
            this.server.on('request', (req, res) => new executor_1.RequestExecutor(req, res, this.nodeDispatcher, this.context, registry_1.Registry.instance, this.config).exec());
            this.server.on('close', () => {
                this.closed = true;
                if (this.connectionCount === 0) {
                    this.nodeDispatcher.destroyApplicationContext();
                }
            });
            this.prepareApplicationContext();
            yield new Promise((complete, fail) => this.server.listen(port, hostname, complete));
            this.closed = false;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((complete, fail) => this.server.close(complete));
        });
    }
    address() {
        return this.server.address();
    }
    prepareApplicationContext() {
        this.nodeDispatcher.createApplicationContext();
        for (let node of registry_1.Registry.instance.valuesOfEventNodes()) {
            this.nodeDispatcher.createInstanceOnApplicationLocal(node);
        }
    }
    prepareSessionContext(connection) {
        let session = this.nodeDispatcher.createSessionContext();
        for (let node of registry_1.Registry.instance.valuesOfRouteNodes()) {
            this.nodeDispatcher.createInstanceOnSessionLocal(node, session);
        }
        connection.__session__ = session;
        connection.on('close', () => {
            this.nodeDispatcher.destroySessionContext(session);
            this.connectionCount--;
            if (this.closed) {
                this.nodeDispatcher.destroyApplicationContext();
            }
        });
        this.connectionCount++;
    }
}
exports.HttpServer = HttpServer;

//# sourceMappingURL=server.js.map
