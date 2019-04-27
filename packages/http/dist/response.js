"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerResponse {
    constructor() {
        this._status = 200;
        this._headers = Object.create(null);
        this._body = null;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
    }
    setHeader(name, value) {
        this._headers[name] = value;
    }
    getHeader(name) {
        return this._headers[name];
    }
    get headers() {
        return this._headers;
    }
    get body() {
        return this._body;
    }
    set body(body) {
        this._body = body;
    }
}
exports.ServerResponse = ServerResponse;

//# sourceMappingURL=response.js.map
