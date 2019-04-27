"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_1 = require("./scope");
const dependency_1 = require("./dependency");
function BaseScope(scope, providerKey) {
    return (target, propertyKey, parameterIndex) => {
        if (target.constructor === Function) {
            dependency_1.DependencyContainer.instance.set(target, 'constructor', parameterIndex, providerKey, scope);
        }
        else {
            dependency_1.DependencyContainer.instance.set(target.constructor, propertyKey, parameterIndex, providerKey, scope);
        }
    };
}
function ApplicationScope(providerKey) {
    return BaseScope(scope_1.Scope.APPLICATION, providerKey);
}
exports.ApplicationScope = ApplicationScope;
function SessionScope(providerKey) {
    return BaseScope(scope_1.Scope.SESSION, providerKey);
}
exports.SessionScope = SessionScope;
function RequestScope(providerKey) {
    return BaseScope(scope_1.Scope.REQUEST, providerKey);
}
exports.RequestScope = RequestScope;

//# sourceMappingURL=decorators.js.map
