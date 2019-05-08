"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParameterPoint;
(function (ParameterPoint) {
    ParameterPoint[ParameterPoint["REQUEST"] = 0] = "REQUEST";
    ParameterPoint[ParameterPoint["REQUEST_URL"] = 1] = "REQUEST_URL";
    ParameterPoint[ParameterPoint["REQUEST_QUERY"] = 2] = "REQUEST_QUERY";
    ParameterPoint[ParameterPoint["REQUEST_HEADERS"] = 3] = "REQUEST_HEADERS";
    ParameterPoint[ParameterPoint["REQUEST_PARAMS"] = 4] = "REQUEST_PARAMS";
    ParameterPoint[ParameterPoint["REQUEST_BODY"] = 5] = "REQUEST_BODY";
    ParameterPoint[ParameterPoint["RESPONSE"] = 6] = "RESPONSE";
    ParameterPoint[ParameterPoint["ERROR"] = 7] = "ERROR";
})(ParameterPoint = exports.ParameterPoint || (exports.ParameterPoint = {}));
class AutoMethodProperties {
    constructor(node) {
        this.node = node;
    }
    getNode() {
        return this.node;
    }
    setParameter(index, point) {
        if (this.parameters === undefined) {
            this.parameters = new Map();
        }
        this.parameters.set(index, point);
    }
    hasParameters() {
        if (this.parameters === undefined) {
            return false;
        }
        return this.parameters.size > 0;
    }
    *entriesOfParameters() {
        if (this.parameters !== undefined) {
            for (let item of this.parameters.entries()) {
                yield item;
            }
        }
    }
    addMiddleware(m) {
        if (this.middlewares === undefined) {
            this.middlewares = [];
        }
        this.middlewares.push(m);
    }
    *valuesOfMiddlewares() {
        if (this.middlewares !== undefined) {
            for (let m of this.middlewares) {
                yield m;
            }
        }
    }
}
exports.AutoMethodProperties = AutoMethodProperties;
class AutoMethodPayload {
    constructor() {
        this.responseStatus = 200;
    }
    setResponseStatus(responseStatus) {
        this.responseStatus = responseStatus;
    }
    getResponseStatus() {
        return this.responseStatus;
    }
}
exports.AutoMethodPayload = AutoMethodPayload;

//# sourceMappingURL=automethod.js.map
