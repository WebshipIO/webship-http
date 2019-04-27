"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("./node");
class Context {
    constructor() {
        this.providerInstanceContainer = new Map();
        this.nodeInstanceContainer = new node_1.NodeInstanceContainer();
    }
}
exports.Context = Context;
class RequestContext extends Context {
}
exports.RequestContext = RequestContext;
class SessionContext extends Context {
    constructor() {
        super(...arguments);
        this.requests = new Map();
    }
}
exports.SessionContext = SessionContext;
class ApplicationContext extends Context {
    constructor() {
        super(...arguments);
        this.sessions = new Map();
    }
    static get instance() {
        if (ApplicationContext.sInstance === undefined) {
            ApplicationContext.sInstance = new ApplicationContext();
        }
        return ApplicationContext.sInstance;
    }
    createSessionContext(session) {
        this.sessions.set(session, new SessionContext());
    }
    createRequestContext(session, request) {
        this.sessions.get(session).requests.set(request, new RequestContext());
    }
    clearApplicationContext() {
        this.nodeInstanceContainer.clear();
        this.providerInstanceContainer.clear();
        this.sessions.clear();
    }
    deleteSessionContext(session) {
        this.sessions.delete(session);
    }
    deleteRequestContext(session, request) {
        this.sessions.get(session).requests.delete(request);
    }
    hasSessionContext(session) {
        return this.sessions.has(session);
    }
    hasRequestContext(session, request) {
        return this.sessions.has(session) && this.sessions.get(session).requests.has(request);
    }
    getProviderInstanceContainerOfApplicationLocal() {
        return this.providerInstanceContainer;
    }
    getNodeInstanceContainerOfApplicationLocal() {
        return this.nodeInstanceContainer;
    }
    getProviderInstanceContainerOfSessionLocal(session) {
        return this.sessions.get(session).providerInstanceContainer;
    }
    getNodeInstanceContainerOfSessionLocal(session) {
        return this.sessions.get(session).nodeInstanceContainer;
    }
    getProviderInstanceContainerOfRequestLocal(session, request) {
        return this.sessions.get(session).requests.get(request).providerInstanceContainer;
    }
    getNodeInstanceContainerOfRequestLocal(session, request) {
        return this.sessions.get(session).requests.get(request).nodeInstanceContainer;
    }
    *providerInstancesOfApplicationContext() {
        for (let session of this.sessions.values()) {
            for (let request of session.requests.values()) {
                for (let instance of request.providerInstanceContainer.values()) {
                    yield instance;
                }
            }
            for (let instance of session.providerInstanceContainer.values()) {
                yield instance;
            }
        }
        for (let instance of this.providerInstanceContainer.values()) {
            yield instance;
        }
    }
    *nodeInstancesOfApplicationContext() {
        for (let session of this.sessions.values()) {
            for (let request of session.requests.values()) {
                for (let instance of request.nodeInstanceContainer.values()) {
                    yield instance;
                }
            }
            for (let instance of session.nodeInstanceContainer.values()) {
                yield instance;
            }
        }
        for (let instance of this.nodeInstanceContainer.values()) {
            yield instance;
        }
    }
    *providerInstancesOfSessionContext(session) {
        let context = this.sessions.get(session);
        for (let request of context.requests.values()) {
            for (let instance of request.providerInstanceContainer.values()) {
                yield instance;
            }
        }
        for (let instance of context.providerInstanceContainer.values()) {
            yield instance;
        }
    }
    *nodeInstancesOfSessionContext(session) {
        let context = this.sessions.get(session);
        for (let request of context.requests.values()) {
            for (let instance of request.nodeInstanceContainer.values()) {
                yield instance;
            }
        }
        for (let instance of context.nodeInstanceContainer.values()) {
            yield instance;
        }
    }
    *providerInstancesOfRequestContext(session, request) {
        for (let instance of this.sessions.get(session).requests.get(request).providerInstanceContainer.values()) {
            yield instance;
        }
    }
    *nodeInstancesOfRequestContext(session, request) {
        for (let instance of this.sessions.get(session).requests.get(request).nodeInstanceContainer.values()) {
            yield instance;
        }
    }
}
exports.ApplicationContext = ApplicationContext;

//# sourceMappingURL=context.js.map
