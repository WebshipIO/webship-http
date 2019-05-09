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
const registry_1 = require("./registry");
const executor_1 = require("./executor");
class HttpServer {
    constructor(config) {
        this.nodeDispatcher = new cdi_1.NodeDispatcher(cdi_1.ProviderContainer.instance, cdi_1.DependencyContainer.instance);
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
            this.server.on('request', (req, res) => new executor_1.RequestExecutor(req, res, this.nodeDispatcher, registry_1.Registry.instance, this.config).exec());
            yield this.prepareApplicationContext();
            yield new Promise((complete, fail) => this.server.listen(port, hostname, complete));
            this.closed = false;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.closed) {
                yield new Promise((complete, fail) => this.server.close(complete));
                this.closed = true;
                if (this.connectionCount === 0) {
                    yield this.nodeDispatcher.destroyApplicationContext();
                }
            }
        });
    }
    address() {
        return this.server.address();
    }
    prepareApplicationContext() {
        return __awaiter(this, void 0, void 0, function* () {
            this.context = yield this.nodeDispatcher.createApplicationContext();
            for (let node of registry_1.Registry.instance.valuesOfEventNodes()) {
                yield this.nodeDispatcher.createNodeOfApplicationContext(node);
            }
        });
    }
    prepareSessionContext(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            let session = yield this.nodeDispatcher.createSessionContext();
            for (let node of registry_1.Registry.instance.valuesOfRouteNodes()) {
                yield this.nodeDispatcher.createNodeOfSessionContext(node, session);
            }
            connection.__webnode_http_session__ = session;
            connection.on('close', () => __awaiter(this, void 0, void 0, function* () {
                yield this.nodeDispatcher.destroySessionContext(session);
                this.connectionCount--;
                if (this.closed) {
                    yield this.nodeDispatcher.destroyApplicationContext();
                }
            }));
            this.connectionCount++;
        });
    }
}
exports.HttpServer = HttpServer;

//# sourceMappingURL=server.js.map
