"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerResponseImpl {
    constructor() {
        this.status = 200;
        this.body = null;
        this.headers = Object.create(null);
    }
    setHeader(key, value) {
        this.headers[key] = value;
    }
    getHeader(key) {
        return this.headers[key];
    }
    hasHeader(key) {
        return Reflect.has(this.headers, key);
    }
    removeHeader(key) {
        return Reflect.deleteProperty(this.headers, key);
    }
    *keysOfHeaders() {
        for (let key in this.headers) {
            yield key;
        }
    }
    *valuesOfHeaders() {
        for (let key in this.headers) {
            yield Reflect.get(this.headers, key);
        }
    }
    *entriesOfHeaders() {
        for (let key in this.headers) {
            yield [key, Reflect.get(this.headers, key)];
        }
    }
    getHeaders() {
        return this.headers;
    }
}
exports.ServerResponseImpl = ServerResponseImpl;

//# sourceMappingURL=response.js.map
