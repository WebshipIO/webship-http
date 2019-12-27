"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dependencyContainer = new Map();
const instanceContainer = new Map();
function Injectable(t) {
    const args = Reflect.getMetadata('design:paramtypes', t);
    if (args === undefined && Reflect.getPrototypeOf(t) instanceof Function) {
        throw new Error(`cannot found a valid constructor of 'class ${t.name}'`);
    }
    dependencyContainer.set(t, {
        args: args
    });
    return t;
}
exports.Injectable = Injectable;
class LDIProvider {
    static get(t) {
        let instance;
        if (instanceContainer.has(t)) {
            instance = instanceContainer.get(t);
        }
        else if (dependencyContainer.has(t)) {
            const dep = dependencyContainer.get(t);
            const params = [];
            if (dep.args instanceof Array) {
                for (let arg of dep.args) {
                    let param;
                    if (arg === Number) {
                        param = 0;
                    }
                    else if (arg === String) {
                        param = '';
                    }
                    else if (arg === Boolean) {
                        param = true;
                    }
                    else if (arg === null) {
                        param = undefined;
                    }
                    else if (arg === undefined) {
                        param = undefined;
                    }
                    else if (arg === Array) {
                        param = [];
                    }
                    else if (arg === Object) {
                        param = Object.create(null);
                    }
                    else {
                        param = LDIProvider.get(arg);
                    }
                    params.push(param);
                }
            }
            instance = new t(...params);
            instanceContainer.set(t, instance);
            if (typeof instance.onCreate === 'function') {
                instance.onCreate();
            }
        }
        else {
            throw new Error(`not found 'class ${t.name}' in instance container`);
        }
        return instance;
    }
    static set(t, instance) {
        instanceContainer.set(t, instance);
    }
    static destroy() {
        for (let instance of instanceContainer.values()) {
            if (typeof instance.onDestroy === 'function') {
                instance.onDestroy();
            }
        }
        instanceContainer.clear();
    }
}
exports.LDIProvider = LDIProvider;

//# sourceMappingURL=index.js.map
