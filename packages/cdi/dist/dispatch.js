"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("./scope");
class NodeDispatcher {
    constructor(providerContainer, dependencyContainer, context) {
        this.providerContainer = providerContainer;
        this.dependencyContainer = dependencyContainer;
        this.context = context;
    }
    static create(providerContainer, dependencyContainer, context) {
        return new NodeDispatcher(providerContainer, dependencyContainer, context);
    }
    check() {
        let warns = [];
        for (let [node, propertyKey, dependency] of this.dependencyContainer.entriesOfDependencies()) {
            if (!this.providerContainer.has(dependency.scope, dependency.providerKey)) {
                warns.push({
                    node: node,
                    propertyKey: propertyKey,
                    parameterIndex: dependency.parameterIndex,
                    providerKey: dependency.providerKey,
                    providerType: dependency.providerType,
                    scope: dependency.scope
                });
            }
        }
        for (let warn of warns) {
            console.warn(`provider not found: (node:'${warn.node.name}', propertyKey:'${warn.propertyKey.toString()}', ` +
                `parameterIndex:${warn.parameterIndex}, providerKey:'${warn.providerKey.toString()}', ` +
                `providerType:'${warn.providerType}', scope:${warn.scope})`);
        }
    }
    genArgumentsOnApplicationLocal(node, propertyKey) {
        let args = [];
        for (let dependency of this.dependencyContainer.valuesOfDependencies(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                case scope_1.Scope.REQUEST:
                    break;
            }
        }
        return args;
    }
    genArgumentsOnSessionLocal(node, propertyKey, session) {
        let args = [];
        for (let dependency of this.dependencyContainer.valuesOfDependencies(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfSessionLocal(session).get(dependency.providerKey);
                    break;
                case scope_1.Scope.REQUEST:
                    break;
            }
        }
        return args;
    }
    genArgumentsOnRequestLocal(node, propertyKey, session, request) {
        let args = [];
        for (let dependency of this.dependencyContainer.valuesOfDependencies(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfApplicationLocal().get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfSessionLocal(session).get(dependency.providerKey);
                    break;
                case scope_1.Scope.REQUEST:
                    args[dependency.parameterIndex] = this.context.getProviderInstanceContainerOfRequestLocal(session, request).get(dependency.providerKey);
                    break;
            }
        }
        return args;
    }
    applyOnApplicationLocal(instance, propertyKey) {
        let args = this.genArgumentsOnApplicationLocal(instance.constructor, propertyKey);
        Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
    applyOnSessionLocal(instance, propertyKey, session) {
        let args = this.genArgumentsOnSessionLocal(instance.constructor, propertyKey, session);
        Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
    applyOnRequestLocal(instance, propertyKey, session, request) {
        let args = this.genArgumentsOnRequestLocal(instance.constructor, propertyKey, session, request);
        Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
    createApplicationContext() {
        let providerInstanceContainer = this.context.getProviderInstanceContainerOfApplicationLocal();
        for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.APPLICATION)) {
            providerInstanceContainer.set(key, provider(this.context));
        }
    }
    destroyApplicationContext() {
        for (let instance of this.context.nodeInstancesOfApplicationContext()) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        for (let instance of this.context.providerInstancesOfApplicationContext()) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        this.context.clearApplicationContext();
    }
    createInstanceOnApplicationLocal(node) {
        let instance = Reflect.construct(node, this.genArgumentsOnApplicationLocal(node, 'constructor'));
        this.context.getNodeInstanceContainerOfApplicationLocal().add(node, instance);
        return instance;
    }
    getInstanceOnApplicationLocal(node) {
        return this.context.getNodeInstanceContainerOfApplicationLocal().get(node);
    }
    createSessionContext() {
        let session = Symbol('session');
        this.context.createSessionContext(session);
        for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.SESSION)) {
            this.context.getProviderInstanceContainerOfSessionLocal(session).set(key, provider(this.context, session));
        }
        return session;
    }
    destroySessionContext(session) {
        for (let instance of this.context.nodeInstancesOfSessionContext(session)) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        for (let instance of this.context.providerInstancesOfSessionContext(session)) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        this.context.deleteSessionContext(session);
    }
    createInstanceOnSessionLocal(node, session) {
        let instance = Reflect.construct(node, this.genArgumentsOnSessionLocal(node, 'constructor', session));
        this.context.getNodeInstanceContainerOfSessionLocal(session).add(node, instance);
        return instance;
    }
    getInstanceOnSessionLocal(node, session) {
        return this.context.getNodeInstanceContainerOfSessionLocal(session).get(node);
    }
    createRequestContext(session) {
        let request = Symbol('request');
        this.context.createRequestContext(session, request);
        for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.SESSION)) {
            this.context.getProviderInstanceContainerOfRequestLocal(session, request).set(key, provider(this.context, session, request));
        }
        return request;
    }
    destroyRequestContext(session, request) {
        for (let instance of this.context.nodeInstancesOfRequestContext(session, request)) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        for (let instance of this.context.providerInstancesOfRequestContext(session, request)) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        this.context.deleteRequestContext(session, request);
    }
    createInstanceOnRequestLocal(node, session, request) {
        let instance = Reflect.construct(node, this.genArgumentsOnRequestLocal(node, 'constructor', session, request));
        this.context.getNodeInstanceContainerOfRequestLocal(session, request).add(node, instance);
        return instance;
    }
    getInstanceOnRequestLocal(node, session, request) {
        return this.context.getNodeInstanceContainerOfRequestLocal(session, request).get(node);
    }
}
exports.NodeDispatcher = NodeDispatcher;

//# sourceMappingURL=dispatch.js.map
