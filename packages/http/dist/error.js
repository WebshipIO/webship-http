"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
var HttpErrorCode;
(function (HttpErrorCode) {
    HttpErrorCode[HttpErrorCode["BAD_REQEUST"] = 0] = "BAD_REQEUST";
    HttpErrorCode[HttpErrorCode["UNAUTHORIZED"] = 1] = "UNAUTHORIZED";
    HttpErrorCode[HttpErrorCode["FORBIDDEN"] = 2] = "FORBIDDEN";
    HttpErrorCode[HttpErrorCode["NOT_FOUND"] = 3] = "NOT_FOUND";
    HttpErrorCode[HttpErrorCode["METHOD_NOT_ALLOWED"] = 4] = "METHOD_NOT_ALLOWED";
    HttpErrorCode[HttpErrorCode["NOT_ACCEPTABLE"] = 5] = "NOT_ACCEPTABLE";
    HttpErrorCode[HttpErrorCode["PROXY_AUTHENTICATION_REQUIRED"] = 6] = "PROXY_AUTHENTICATION_REQUIRED";
    HttpErrorCode[HttpErrorCode["REQUEST_TIMEOUT"] = 7] = "REQUEST_TIMEOUT";
    HttpErrorCode[HttpErrorCode["CONFLIT"] = 8] = "CONFLIT";
    HttpErrorCode[HttpErrorCode["INTERNAL_SERVER_ERROR"] = 9] = "INTERNAL_SERVER_ERROR";
    HttpErrorCode[HttpErrorCode["BAD_GATEWAY"] = 10] = "BAD_GATEWAY";
    HttpErrorCode[HttpErrorCode["GATEWAY_TIMEOUT"] = 11] = "GATEWAY_TIMEOUT";
})(HttpErrorCode = exports.HttpErrorCode || (exports.HttpErrorCode = {}));
class HttpError extends Error {
    static create(code, msg, stack) {
        return new HttpError(code, msg, stack);
    }
    constructor(code, msg, stack) {
        let statusCode;
        let message;
        switch (code) {
            case HttpErrorCode.BAD_REQEUST:
                statusCode = 400;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.UNAUTHORIZED:
                statusCode = 401;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.FORBIDDEN:
                statusCode = 403;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.NOT_FOUND:
                statusCode = 404;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.METHOD_NOT_ALLOWED:
                statusCode = 405;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.NOT_ACCEPTABLE:
                statusCode = 406;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.PROXY_AUTHENTICATION_REQUIRED:
                statusCode = 407;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.REQUEST_TIMEOUT:
                statusCode = 408;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.CONFLIT:
                statusCode = 409;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.INTERNAL_SERVER_ERROR:
                statusCode = 500;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.BAD_GATEWAY:
                statusCode = 502;
                message = http_1.STATUS_CODES[statusCode];
                break;
            case HttpErrorCode.GATEWAY_TIMEOUT:
                statusCode = 504;
                message = http_1.STATUS_CODES[statusCode];
                break;
            default:
                statusCode = 500;
                message = http_1.STATUS_CODES[statusCode];
                break;
        }
        if (typeof msg === 'string') {
            message = msg;
        }
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        if (typeof stack === 'string') {
            this.stack = this.stack + '\n' + stack;
        }
    }
}
exports.HttpError = HttpError;
function cond(condition, code, msg, stack) {
    if (!condition) {
        throw new HttpError(code, msg, stack);
    }
}
exports.cond = cond;

//# sourceMappingURL=error.js.map
