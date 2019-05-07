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
const scope_1 = require("./scope");
const node_1 = require("./node");
const tree_1 = require("./tree");
class NodeDispatcher {
    constructor(providerContainer, dependencyContainer) {
        this.providerContainer = providerContainer;
        this.dependencyContainer = dependencyContainer;
    }
    static create(providerContainer, dependencyContainer) {
        return new NodeDispatcher(providerContainer, dependencyContainer);
    }
    check() {
        let warns = [];
        for (let [node, propertyKey, dependency] of this.dependencyContainer.entries()) {
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
    createApplicationContext() {
        return __awaiter(this, void 0, void 0, function* () {
            this.context = new tree_1.TreeNode();
            this.context.value = Object.create(null);
            this.context.value.providerContainer = new Map();
            this.context.value.nodeContainer = new node_1.NodeInstanceContainer();
            let providerInstanceContainer = this.context.value.providerContainer;
            for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.APPLICATION)) {
                let instance = provider(this.context);
                providerInstanceContainer.set(key, instance);
                if (typeof instance.onCreate === 'function') {
                    yield instance.onCreate();
                }
            }
            return this.context;
        });
    }
    createNodeOfApplicationContext(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let instance = Reflect.construct(node, this.genArgumentsOfApplicationContext(node, 'constructor'));
            this.context.value.nodeContainer.add(node, instance);
            if (typeof instance.onCreate === 'function') {
                yield instance.onCreate();
            }
            return instance;
        });
    }
    destroyApplicationContext() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let session of this.context.valuesOfChildren()) {
                yield this.destroySessionContext(session);
            }
            for (let instance of this.context.value.nodeContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            for (let instance of this.context.value.providerContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            this.context.clearChildren();
            this.context.value.nodeContainer.clear();
            this.context.value.providerContainer.clear();
        });
    }
    createSessionContext() {
        return __awaiter(this, void 0, void 0, function* () {
            let session = this.context.addChild();
            session.value = Object.create(null);
            session.value.providerContainer = new Map();
            session.value.nodeContainer = new node_1.NodeInstanceContainer();
            let providerInstanceContainer = session.value.providerContainer;
            for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.SESSION)) {
                let instance = provider(this.context, session);
                providerInstanceContainer.set(key, instance);
                if (typeof instance.onCreate === 'function') {
                    yield instance.onCreate();
                }
            }
            return session;
        });
    }
    createNodeOfSessionContext(node, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let instance = Reflect.construct(node, this.genArgumentsOfSessionContext(node, 'constructor', session));
            session.value.nodeContainer.add(node, instance);
            if (typeof instance.onCreate === 'function') {
                yield instance.onCreate();
            }
            return instance;
        });
    }
    destroySessionContext(session) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let request of session.valuesOfChildren()) {
                yield this.destroyRequestContext(request);
            }
            for (let instance of session.value.nodeContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            for (let instance of session.value.providerContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            session.getParent().deleteChild(session);
        });
    }
    createRequestContext(session) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = session.addChild();
            request.value = Object.create(null);
            request.value.providerContainer = new Map();
            request.value.nodeContainer = new node_1.NodeInstanceContainer();
            let providerInstanceContainer = request.value.providerContainer;
            for (let [key, provider] of this.providerContainer.entries(scope_1.Scope.SESSION)) {
                let instance = provider(this.context, session, request);
                providerInstanceContainer.set(key, instance);
                if (typeof instance.onCreate === 'function') {
                    yield instance.onCreate();
                }
            }
            return request;
        });
    }
    createNodeOfRequestContext(node, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let instance = Reflect.construct(node, this.genArgumentsOfRequestContext(node, 'constructor', request));
            request.value.nodeContainer.add(node, instance);
            if (typeof instance.onCreate === 'function') {
                yield instance.onCreate();
            }
            return instance;
        });
    }
    destroyRequestContext(request) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let instance of request.value.nodeContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            for (let instance of request.value.providerContainer.values()) {
                if (typeof instance.onDestroy === 'function') {
                    yield instance.onDestroy();
                }
            }
            request.getParent().deleteChild(request);
        });
    }
    genArgumentsOfApplicationContext(node, propertyKey) {
        let args = [];
        for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                case scope_1.Scope.REQUEST:
                    break;
            }
        }
        return args;
    }
    genArgumentsOfSessionContext(node, propertyKey, session) {
        let args = [];
        for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                    args[dependency.parameterIndex] = session.value.providerContainer.get(dependency.providerKey);
                    break;
                case scope_1.Scope.REQUEST:
                    break;
            }
        }
        return args;
    }
    genArgumentsOfRequestContext(node, propertyKey, request) {
        let args = [];
        for (let dependency of this.dependencyContainer.values(node, propertyKey)) {
            switch (dependency.scope) {
                case scope_1.Scope.APPLICATION:
                    args[dependency.parameterIndex] = this.context.value.providerContainer.get(dependency.providerKey);
                    break;
                case scope_1.Scope.SESSION:
                    args[dependency.parameterIndex] = request.getParent().value.providerContainer.get(dependency.providerKey);
                    break;
                case scope_1.Scope.REQUEST:
                    args[dependency.parameterIndex] = request.value.providerContainer.get(dependency.providerKey);
                    break;
            }
        }
        return args;
    }
    applyOfApplicationContext(instance, propertyKey) {
        let args = this.genArgumentsOfApplicationContext(instance.constructor, propertyKey);
        return Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
    applyOfSessionContext(instance, propertyKey, session) {
        let args = this.genArgumentsOfSessionContext(instance.constructor, propertyKey, session);
        return Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
    applyOfRequestContext(instance, propertyKey, request) {
        let args = this.genArgumentsOfRequestContext(instance.constructor, propertyKey, request);
        return Reflect.apply(Reflect.get(instance, propertyKey), instance, args);
    }
}
exports.NodeDispatcher = NodeDispatcher;

//# sourceMappingURL=dispatch.js.map
