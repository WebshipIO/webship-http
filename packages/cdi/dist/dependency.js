"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
class DependencyContainer {
    constructor() {
        this.map = new Map();
    }
    static get instance() {
        if (DependencyContainer.sInstance === undefined) {
            DependencyContainer.sInstance = new DependencyContainer();
        }
        return DependencyContainer.sInstance;
    }
    set(node, propertyKey, parameterIndex, providerKey, scope) {
        if (!this.map.has(node)) {
            this.map.set(node, new Map());
        }
        let dependency = {
            providerKey: providerKey,
            providerType: Reflect.getMetadata("design:type", node.prototype, propertyKey),
            scope: scope,
            parameterIndex: parameterIndex
        };
        if (!this.map.get(node).has(propertyKey)) {
            this.map.get(node).set(propertyKey, []);
        }
        this.map.get(node).get(propertyKey)[parameterIndex] = dependency;
    }
    get(node, propertyKey) {
        if (this.map.has(node) && this.map.get(node).has(propertyKey)) {
            return this.map.get(node).get(propertyKey);
        }
        return [];
    }
    delete(node, propertyKey) {
        if (this.map.has(node)) {
            if (arguments.length > 1) {
                if (this.map.get(node).has(propertyKey)) {
                    this.map.get(node).delete(propertyKey);
                }
            }
            else {
                this.map.delete(node);
            }
        }
    }
    *valuesOfDependencies(node, propertyKey) {
        if (this.map.has(node)) {
            let propertyKeyMap = this.map.get(node);
            if (propertyKeyMap.has(propertyKey)) {
                for (let dependency of propertyKeyMap.get(propertyKey)) {
                    if (dependency !== undefined) {
                        yield dependency;
                    }
                }
            }
        }
    }
    *entriesOfDependencies() {
        for (let [node, propertyKeyMap] of this.map.entries()) {
            for (let [propertyKey, dependencies] of propertyKeyMap.entries()) {
                for (let dependency of dependencies) {
                    if (dependency !== undefined) {
                        yield [node, propertyKey, dependency];
                    }
                }
            }
        }
    }
}
exports.DependencyContainer = DependencyContainer;
function* chainClassType(x) {
    let constructs = [x];
    for (let c of constructs) {
        yield c;
        let next = Object.getPrototypeOf(c);
        if (next === Function.prototype) {
            break;
        }
        constructs.push(next);
    }
}

//# sourceMappingURL=dependency.js.map
