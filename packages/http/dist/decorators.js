"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automethod_1 = require("./automethod");
const registry_1 = require("./registry");
const event_1 = require("./event");
function Controller(node) {
    registry_1.Registry.instance.registerRouteNode(node);
    return node;
}
exports.Controller = Controller;
function RequestLifecycle(node) {
    registry_1.Registry.instance.registerEventNode(node);
    return node;
}
exports.RequestLifecycle = RequestLifecycle;
function RequestMapping(method, rePathname) {
    return function (target, propertyKey, descriptor) {
        registry_1.Registry.instance.registerRoute(target.constructor, descriptor.value, method, rePathname);
    };
}
exports.RequestMapping = RequestMapping;
function Middleware(middleware) {
    return function (target, propertyKey, descriptor) {
        registry_1.Registry.instance.registerMiddleware(target.constructor, middleware);
    };
}
exports.Middleware = Middleware;
function ParameterMapping(point) {
    return function (target, propertyKey, parameterIndex) {
        registry_1.Registry.instance.registerParameter(target.constructor, Reflect.get(target, propertyKey), parameterIndex, point);
    };
}
exports.ParameterMapping = ParameterMapping;
function createMiddleware(middleware) {
    return function (target, propertyKey, descriptor) {
        registry_1.Registry.instance.registerMiddleware(target.constructor, middleware);
    };
}
exports.createMiddleware = createMiddleware;
function ResStatus(status) {
    return function (target, propertyKey, descriptor) {
        registry_1.Registry.instance.registerResponseStatus(target.constructor, descriptor.value, status);
    };
}
exports.ResStatus = ResStatus;
function RequestStart(target, propertyKey, descriptor) {
    registry_1.Registry.instance.registerEvent(target.constructor, descriptor.value, event_1.Event.REQUEST_START);
}
exports.RequestStart = RequestStart;
function RequestEnd(target, propertyKey, descriptor) {
    registry_1.Registry.instance.registerEvent(target.constructor, descriptor.value, event_1.Event.REQUEST_END);
}
exports.RequestEnd = RequestEnd;
function RequestError(target, propertyKey, descriptor) {
    registry_1.Registry.instance.registerEvent(target.constructor, descriptor.value, event_1.Event.REQUEST_ERROR);
}
exports.RequestError = RequestError;
function Get(requestRePathname) {
    return RequestMapping('GET', requestRePathname);
}
exports.Get = Get;
function Post(requestRePathname) {
    return RequestMapping('POST', requestRePathname);
}
exports.Post = Post;
function Put(requestRePathname) {
    return RequestMapping('PUT', requestRePathname);
}
exports.Put = Put;
function Delete(requestRePathname) {
    return RequestMapping('DELETE', requestRePathname);
}
exports.Delete = Delete;
function Head(requestRePathname) {
    return RequestMapping('HEAD', requestRePathname);
}
exports.Head = Head;
function Trace(requestRePathname) {
    return RequestMapping('TRACE', requestRePathname);
}
exports.Trace = Trace;
function Options(requestRePathname) {
    return RequestMapping('OPTIONS', requestRePathname);
}
exports.Options = Options;
function Connect(requestRePathname) {
    return RequestMapping('CONNECT', requestRePathname);
}
exports.Connect = Connect;
function Patch(requestRePathname) {
    return RequestMapping('PATCH', requestRePathname);
}
exports.Patch = Patch;
function Req() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST);
}
exports.Req = Req;
function Res() {
    return ParameterMapping(automethod_1.ParameterPoint.RESPONSE);
}
exports.Res = Res;
function Uri() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST_URI);
}
exports.Uri = Uri;
function Headers() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST_HEADERS);
}
exports.Headers = Headers;
function Params() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST_PARAMS);
}
exports.Params = Params;
function Query() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST_QUERY);
}
exports.Query = Query;
function ReqBody() {
    return ParameterMapping(automethod_1.ParameterPoint.REQUEST_BODY);
}
exports.ReqBody = ReqBody;

//# sourceMappingURL=decorators.js.map
