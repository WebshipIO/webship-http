"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automethod_1 = require("./automethod");
const route_1 = require("./route");
class Registry {
    constructor() {
        this.autoMethodPropertiesContainer = new Map();
        this.autoMethodPayloadContainer = new Map();
        this.routeContainer = new Map();
        this.eventContainer = new Map();
        this.routeNodeSet = new Set();
        this.eventNodeSet = new Set();
    }
    static get instance() {
        if (Registry.sInstance === undefined) {
            Registry.sInstance = new Registry();
        }
        return Registry.sInstance;
    }
    *valuesOfEventAutoMethods(event) {
        if (this.eventContainer.has(event)) {
            let value = this.eventContainer.get(event);
            if (value instanceof Array) {
                for (let item of value) {
                    yield item;
                }
            }
            else {
                yield value;
            }
        }
    }
    *valuesOfEventNodes() {
        for (let node of this.eventNodeSet) {
            yield node;
        }
    }
    *valuesOfRouteNodes() {
        for (let node of this.routeNodeSet) {
            yield node;
        }
    }
    getRoute(method, pathname) {
        if (!this.routeContainer.has(method)) {
            return [null, null];
        }
        for (let [rePathname, route] of this.routeContainer.get(method).entries()) {
            if (route.isActive()) {
                let pathnameRegExp = route.getRequestPathnameRegExp();
                let input = pathnameRegExp.re.exec(pathname);
                if (input !== null) {
                    for (let autoMethod of route.valuesOfAutoMethods()) {
                        let node = this.autoMethodPropertiesContainer.get(autoMethod).getNode();
                        let params = Object.create(null);
                        for (let [i, key] of pathnameRegExp.keys.entries()) {
                            params[key.name] = input[i + 1];
                        }
                        return [route, params];
                    }
                }
            }
        }
        return [null, null];
    }
    getAutoMethodProperties(autoMethod) {
        return this.autoMethodPropertiesContainer.get(autoMethod);
    }
    getAutoMethodPayload(autoMethod) {
        return this.autoMethodPayloadContainer.get(autoMethod);
    }
    hasAutoMethodProperties(autoMethod) {
        return this.autoMethodPropertiesContainer.has(autoMethod);
    }
    hasAutoMethodPayload(autoMethod) {
        return this.autoMethodPayloadContainer.has(autoMethod);
    }
    registerParameter(node, autoMethod, parameterIndex, point) {
        if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
            this.autoMethodPropertiesContainer.set(autoMethod, new automethod_1.AutoMethodProperties(node));
        }
        this.autoMethodPropertiesContainer.get(autoMethod).setParameter(parameterIndex, point);
    }
    registerResponseStatus(node, autoMethod, status) {
        if (!this.autoMethodPayloadContainer.has(autoMethod)) {
            this.autoMethodPayloadContainer.set(autoMethod, new automethod_1.AutoMethodPayload());
        }
        this.autoMethodPayloadContainer.get(autoMethod).setResponseStatus(status);
    }
    registerMiddleware(node, autoMethod) {
        if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
            this.autoMethodPropertiesContainer.set(autoMethod, new automethod_1.AutoMethodProperties(node));
        }
        this.autoMethodPropertiesContainer.get(autoMethod).addMiddleware(autoMethod);
    }
    registerRoute(node, autoMethod, method, rePathname) {
        if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
            this.autoMethodPropertiesContainer.set(autoMethod, new automethod_1.AutoMethodProperties(node));
        }
        if (!this.routeContainer.has(method)) {
            this.routeContainer.set(method, new Map());
        }
        let methods = this.routeContainer.get(method);
        if (!methods.has(rePathname)) {
            methods.set(rePathname, new route_1.Route(method, rePathname));
        }
        methods.get(rePathname).addAutoMethod(autoMethod);
    }
    registerEvent(node, autoMethod, event) {
        if (!this.autoMethodPropertiesContainer.has(autoMethod)) {
            this.autoMethodPropertiesContainer.set(autoMethod, new automethod_1.AutoMethodProperties(node));
        }
        if (this.eventContainer.has(event)) {
            let tmp = this.eventContainer.get(event);
            if (tmp instanceof Array) {
                tmp.push(autoMethod);
            }
            else {
                this.eventContainer.set(event, [tmp, autoMethod]);
            }
        }
        else {
            this.eventContainer.set(event, autoMethod);
        }
    }
    registerRouteNode(node) {
        this.routeNodeSet.add(node);
    }
    registerEventNode(node) {
        this.eventNodeSet.add(node);
    }
}
exports.Registry = Registry;

//# sourceMappingURL=registry.js.map
