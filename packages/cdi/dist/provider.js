"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("./scope");
class ProviderContainer {
    constructor() {
        this.applicationMap = new Map();
        this.sessionMap = new Map();
        this.requestMap = new Map();
    }
    static get instance() {
        if (ProviderContainer.sInstance === undefined) {
            ProviderContainer.sInstance = new ProviderContainer();
        }
        return ProviderContainer.sInstance;
    }
    set(scope, key, provider) {
        this.getScopeMap(scope).set(key, provider);
    }
    has(scope, key) {
        return this.getScopeMap(scope).has(key);
    }
    get(scope, key) {
        return this.getScopeMap(scope).get(key);
    }
    delete(scope, key) {
        this.getScopeMap(scope).delete(key);
    }
    clear() {
        this.applicationMap.clear();
        this.sessionMap.clear();
        this.requestMap.clear();
    }
    size(scope) {
        return this.getScopeMap(scope).size;
    }
    *values(scope) {
        for (let item of this.getScopeMap(scope).values()) {
            yield item;
        }
    }
    *entries(scope) {
        for (let item of this.getScopeMap(scope).entries()) {
            yield item;
        }
    }
    getScopeMap(scope) {
        switch (scope) {
            case scope_1.Scope.APPLICATION:
                return this.applicationMap;
            case scope_1.Scope.SESSION:
                return this.sessionMap;
            case scope_1.Scope.REQUEST:
                return this.requestMap;
            default:
                throw new Error('bad scope' + String(scope));
        }
    }
}
exports.ProviderContainer = ProviderContainer;

//# sourceMappingURL=provider.js.map
