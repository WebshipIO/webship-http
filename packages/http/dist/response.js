"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerResponseImpl {
    constructor() {
        this.status = 200;
        this.body = null;
        this._headers = Object.create(null);
    }
    setHeader(key, value) {
        this._headers[key] = value;
    }
    getHeader(key) {
        return this._headers[key];
    }
    hasHeader(key) {
        return Reflect.has(this._headers, key);
    }
    removeHeader(key) {
        Reflect.deleteProperty(this._headers, key);
    }
    *keysOfHeaders() {
        for (let key in this._headers) {
            yield key;
        }
    }
    *valuesOfHeaders() {
        for (let key in this._headers) {
            yield Reflect.get(this._headers, key);
        }
    }
    *entriesOfHeaders() {
        for (let key in this._headers) {
            yield [key, Reflect.get(this._headers, key)];
        }
    }
    get headers() {
        return this._headers;
    }
    set headers(_headers) {
        this._headers = _headers;
    }
}
exports.ServerResponseImpl = ServerResponseImpl;

//# sourceMappingURL=response.js.map
