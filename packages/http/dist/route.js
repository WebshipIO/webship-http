"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PathToRegexp = require("path-to-regexp");
class PathnameRegExp {
    constructor(rePathname) {
        this.keys = [];
        this.rePathname = rePathname;
        this.re = PathToRegexp(this.rePathname, this.keys);
    }
}
exports.PathnameRegExp = PathnameRegExp;
class Route {
    constructor(requestMethod, requestRePathname) {
        this.requestMethod = requestMethod;
        this.requestRePathname = requestRePathname;
        this.active = true;
        this.requestPathnameRegExp = new PathnameRegExp(requestRePathname);
    }
    setActive(active) {
        this.active = active;
    }
    isActive() {
        return this.active;
    }
    addAutoMethod(autoMethod) {
        if (this.autoMethods instanceof Array) {
            this.autoMethods.push(autoMethod);
        }
        else if (this.autoMethods === undefined) {
            this.autoMethods = autoMethod;
        }
        else {
            let tmp = this.autoMethods;
            this.autoMethods = [tmp];
            this.autoMethods.push(autoMethod);
        }
    }
    *valuesOfAutoMethods() {
        if (this.autoMethods instanceof Array) {
            for (let autoMethod of this.autoMethods) {
                yield autoMethod;
            }
        }
        else if (this.autoMethods === undefined) {
        }
        else {
            yield this.autoMethods;
        }
    }
    getRequestMethod() {
        return this.requestMethod;
    }
    getRequestRePathname() {
        return this.requestRePathname;
    }
    getRequestPathnameRegExp() {
        return this.requestPathnameRegExp;
    }
}
exports.Route = Route;

//# sourceMappingURL=route.js.map
