"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const url_1 = require("url");
const formidable_1 = require("formidable");
const error_1 = require("./error");
const response_1 = require("./response");
const automethod_1 = require("./automethod");
const event_1 = require("./event");
function hasContent(headerKey, headerContent) {
    if (typeof headerKey === 'string' && headerKey.search(headerContent) > -1) {
        return true;
    }
    return false;
}
function hasFormData(headerKey) {
    return hasContent(headerKey, "application/json") ||
        hasContent(headerKey, "multipart/form-data") ||
        hasContent(headerKey, "application/x-www-form-urlencoded");
}
class RequestExecutor {
    constructor(nativeRequest, nativeResponse, nodeDispatcher, registry, config) {
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
        this.nodeDispatcher = nodeDispatcher;
        this.registry = registry;
        this.config = config;
        this.request = Object.create(null);
        this.response = new response_1.ServerResponseImpl();
        this.ended = false;
        let request = this.request;
        request.httpVersion = nativeRequest.httpVersion;
        request.httpVersionMajor = nativeRequest.httpVersionMajor;
        request.httpVersionMinor = nativeRequest.httpVersionMinor;
        request.url = url_1.parse(decodeURIComponent(nativeRequest.url), true);
        request.method = (request.url.query.__method ? request.url.query.__method : nativeRequest.method).toUpperCase();
        request.headers = nativeRequest.headers;
        request.remoteAddress = this.nativeRequest.connection.remoteAddress;
        request.remotePort = this.nativeRequest.connection.remotePort;
        request.localAddress = this.nativeRequest.connection.localAddress;
        request.localPort = this.nativeRequest.connection.localPort;
        [this.route, request.params] = this.registry.getRoute(request.method, request.url.pathname);
        this.sessionContext = this.nativeRequest.connection.__webnode_http_session__;
        this.applicationContext = this.sessionContext.getParent();
    }
    parseCharSequence() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((complete, fail) => {
                let body = '';
                this.nativeRequest.on('data', (data) => {
                    body += data;
                });
                this.nativeRequest.on('error', (error) => {
                    fail(error_1.HttpError.create(error_1.HttpErrorCode.BAD_REQEUST, error.message, error.stack));
                });
                this.nativeRequest.on('end', () => {
                    this.request.body = body;
                    complete();
                });
            });
        });
    }
    parseFormData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((complete, fail) => {
                let body = Object.create(null);
                this.createIncomingForm()
                    .on("error", (error) => {
                    fail(error_1.HttpError.create(error_1.HttpErrorCode.BAD_REQEUST, error.message, error.stack));
                })
                    .on("file", (name, file) => {
                    if (!(name in body)) {
                        body[name] = [];
                    }
                    body[name].push(file);
                })
                    .on("field", (name, value) => {
                    body[name] = value;
                })
                    .on("end", () => {
                    this.request.body = body;
                    complete();
                })
                    .parse(this.nativeRequest);
            });
        });
    }
    parseReqBody() {
        return __awaiter(this, void 0, void 0, function* () {
            if (hasFormData(this.nativeRequest.headers["content-type"])) {
                yield this.parseFormData();
            }
            else {
                yield this.parseCharSequence();
            }
        });
    }
    prepareContext() {
        return __awaiter(this, void 0, void 0, function* () {
            this.request.context = yield this.nodeDispatcher.createRequestContext(this.sessionContext);
            this.nativeResponse.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                this.ended = true;
                for (let autoMethod of this.registry.valuesOfEventAutoMethods(event_1.Event.REQUEST_END)) {
                    let properties = this.registry.getAutoMethodProperties(autoMethod);
                    let node = properties.getNode();
                    let args = this.nodeDispatcher.genArgumentsOfRequestContext(node, autoMethod.name, this.request.context);
                    let instance = this.applicationContext.value.nodeContainer.get(node);
                    this.composeArgs(properties, args);
                    yield Reflect.apply(autoMethod, instance, args);
                }
                yield this.nodeDispatcher.destroyRequestContext(this.request.context);
            }));
            this.nativeResponse.on('error', (error) => this.error = error);
            this.nativeRequest.on('error', (error) => this.error = error);
            this.nativeRequest.on('close', () => __awaiter(this, void 0, void 0, function* () {
                if (!this.ended) {
                    this.ended = true;
                    for (let autoMethod of this.registry.valuesOfEventAutoMethods(event_1.Event.REQUEST_ERROR)) {
                        let properties = this.registry.getAutoMethodProperties(autoMethod);
                        let node = properties.getNode();
                        let args = this.nodeDispatcher.genArgumentsOfRequestContext(node, autoMethod.name, this.request.context);
                        let instance = this.applicationContext.value.nodeContainer.get(node);
                        this.composeArgs(properties, args);
                        yield Reflect.apply(autoMethod, instance, args);
                    }
                    yield this.nodeDispatcher.destroyRequestContext(this.request.context);
                }
            }));
            for (let autoMethod of this.registry.valuesOfEventAutoMethods(event_1.Event.REQUEST_START)) {
                let properties = this.registry.getAutoMethodProperties(autoMethod);
                let node = properties.getNode();
                let args = this.nodeDispatcher.genArgumentsOfRequestContext(node, autoMethod.name, this.request.context);
                let instance = this.applicationContext.value.nodeContainer.get(node);
                this.composeArgs(properties, args);
                yield Reflect.apply(autoMethod, instance, args);
            }
        });
    }
    execRoute() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let autoMethod of this.route.valuesOfAutoMethods()) {
                let properties = this.registry.getAutoMethodProperties(autoMethod);
                let node = properties.getNode();
                let args = this.nodeDispatcher.genArgumentsOfRequestContext(node, autoMethod.name, this.request.context);
                let instance = this.sessionContext.value.nodeContainer.get(node);
                if (this.registry.hasAutoMethodPayload(autoMethod)) {
                    this.response.status = this.registry.getAutoMethodPayload(autoMethod).getResponseStatus();
                }
                this.composeArgs(properties, args);
                for (let middleware of properties.valuesOfMiddlewares()) {
                    yield Reflect.apply(middleware, instance, [this.request, this.response]);
                }
                yield Reflect.apply(autoMethod, instance, args);
            }
        });
    }
    send() {
        this.nativeResponse.writeHead(this.response.status, this.response.getHeaders());
        if (this.response.body === undefined || this.response.body === null) {
            this.nativeResponse.end();
        }
        else if (typeof this.response.body === 'object') {
            if (this.response.body instanceof Buffer) {
                this.nativeResponse.end(this.response.body);
            }
            else if (this.response.body instanceof stream_1.Readable) {
                this.response.body.pipe(this.nativeResponse);
            }
            else {
                this.nativeResponse.end(JSON.stringify(this.response.body));
            }
        }
        else if (typeof this.response.body === 'string') {
            this.nativeResponse.end(this.response.body);
        }
        else {
            this.nativeResponse.end(String(this.response.body));
        }
    }
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prepareContext();
            try {
                if (this.route === null) {
                    this.execHttpError(error_1.HttpError.create(error_1.HttpErrorCode.NOT_FOUND));
                }
                else {
                    yield this.parseReqBody();
                    yield this.execRoute();
                    this.send();
                }
            }
            catch (err) {
                if (!(err instanceof error_1.HttpError)) {
                    err = error_1.HttpError.create(error_1.HttpErrorCode.INTERNAL_SERVER_ERROR, err.message, err.stack);
                }
                this.execHttpError(err);
            }
        });
    }
    composeArgs(properties, args) {
        for (let [index, point] of properties.entriesOfParameters()) {
            switch (point) {
                case automethod_1.ParameterPoint.REQUEST:
                    args[index] = this.request;
                    break;
                case automethod_1.ParameterPoint.RESPONSE:
                    args[index] = this.response;
                    break;
                case automethod_1.ParameterPoint.REQUEST_URL:
                    args[index] = this.request.url;
                    break;
                case automethod_1.ParameterPoint.REQUEST_QUERY:
                    args[index] = this.request.url.query;
                    break;
                case automethod_1.ParameterPoint.REQUEST_HEADERS:
                    args[index] = this.nativeRequest.headers;
                    break;
                case automethod_1.ParameterPoint.REQUEST_PARAMS:
                    args[index] = this.request.params;
                    break;
                case automethod_1.ParameterPoint.REQUEST_BODY:
                    args[index] = this.request.body;
                    break;
                case automethod_1.ParameterPoint.ERROR:
                    args[index] = this.error;
                    break;
            }
        }
    }
    execHttpError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.error = error;
            this.nativeResponse.writeHead(error.statusCode);
            this.nativeResponse.end(JSON.stringify({
                message: error.message,
                stack: error.stack
            }));
        });
    }
    createIncomingForm() {
        return Object.assign(new formidable_1.IncomingForm(), this.config);
    }
}
exports.RequestExecutor = RequestExecutor;

//# sourceMappingURL=executor.js.map
