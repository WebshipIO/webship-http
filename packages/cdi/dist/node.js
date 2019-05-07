"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodeInstanceContainer {
    constructor() {
        this.map = new Map();
    }
    add(node, instance) {
        if (this.map.has(node)) {
            let value = this.map.get(node);
            if (value instanceof Set) {
                value.add(instance);
            }
            else {
                this.map.set(node, new Set().add(value));
            }
        }
        else {
            this.map.set(node, instance);
        }
        return this;
    }
    get(node) {
        return this.map.get(node);
    }
    has(node) {
        return this.map.has(node);
    }
    delete(node) {
        this.map.delete(node);
    }
    clear() {
        this.map.clear();
    }
    size() {
        return this.map.size;
    }
    *values() {
        for (let value of this.map.values()) {
            if (value instanceof Set) {
                for (let a of value) {
                    yield a;
                }
            }
            else {
                yield value;
            }
        }
    }
    *entries() {
        for (let [key, value] of this.map.entries()) {
            if (value instanceof Set) {
                for (let v of value) {
                    yield [key, v];
                }
            }
            else {
                yield [key, value];
            }
        }
    }
}
exports.NodeInstanceContainer = NodeInstanceContainer;

//# sourceMappingURL=node.js.map
