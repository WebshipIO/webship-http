"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_decorators_1 = require("jest-decorators");
const __1 = require("..");
const __2 = require("..");
class A {
    constructor() {
        this.value = 100;
    }
    getValue() {
        return this.value;
    }
    onDestroy() {
        this.value = 0;
    }
}
let B = class B {
    constructor(a1, a3) {
        this.a1 = a1;
        this.a3 = a3;
        this.value = 100;
    }
    getA1() {
        return this.a1;
    }
    getA2() {
        return this.a2;
    }
    getA3() {
        return this.a3;
    }
    getA4() {
        return this.a4;
    }
    setA2(a) {
        this.a2 = a;
    }
    setA4(a) {
        this.a4 = a;
    }
    getValue() {
        return this.value;
    }
    onDestroy() {
        this.value = 0;
    }
};
__decorate([
    __param(0, __1.ApplicationScope('a')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [A]),
    __metadata("design:returntype", void 0)
], B.prototype, "setA2", null);
__decorate([
    __param(0, __1.RequestScope('a')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [A]),
    __metadata("design:returntype", void 0)
], B.prototype, "setA4", null);
B = __decorate([
    __param(0, __1.ApplicationScope('a')),
    __param(1, __1.SessionScope('a')),
    __metadata("design:paramtypes", [A,
        A])
], B);
let ApplicationTest = class ApplicationTest {
    suiteSetup() {
        this.dispatcher = __2.NodeDispatcher.create(__2.ProviderContainer.instance, __2.DependencyContainer.instance, new __2.ApplicationContext());
        __2.ProviderContainer.instance.set(__1.Scope.APPLICATION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.SESSION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.REQUEST, 'a', () => new A);
        this.dispatcher.check();
        this.dispatcher.createApplicationContext();
        this.b = this.dispatcher.createInstanceOnApplicationLocal(B);
    }
    teardown() {
        this.b = null;
        __2.ProviderContainer.instance.delete(__1.Scope.APPLICATION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.SESSION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.REQUEST, 'a');
    }
    value() {
        expect(this.b.getValue()).toBe(100);
    }
    a1() {
        expect(this.b.getA1().getValue()).toBe(100);
    }
    a2() {
        this.dispatcher.applyOnApplicationLocal(this.b, 'setA2');
        expect(this.b.getA2().getValue()).toBe(100);
    }
    a3() {
        expect(this.b.getA3()).toBe(undefined);
    }
    a4() {
        expect(this.b.getA4()).toBe(undefined);
    }
    equalA1A2() {
        expect(this.b.getA1()).toBe(this.b.getA2());
    }
    destroy() {
        this.dispatcher.destroyApplicationContext();
        expect(this.b.getA1().getValue()).toBe(0);
        expect(this.b.getA2().getValue()).toBe(0);
        expect(this.b.getValue()).toBe(0);
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "suiteSetup", null);
__decorate([
    jest_decorators_1.SuiteTeardown,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "teardown", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "value", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "a1", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "a2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "a3", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "a4", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "equalA1A2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "destroy", null);
ApplicationTest = __decorate([
    jest_decorators_1.Suite
], ApplicationTest);
let SessionTest = class SessionTest {
    suiteSetup() {
        this.dispatcher = __2.NodeDispatcher.create(__2.ProviderContainer.instance, __2.DependencyContainer.instance, new __2.ApplicationContext());
        __2.ProviderContainer.instance.set(__1.Scope.APPLICATION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.SESSION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.REQUEST, 'a', () => new A);
        this.dispatcher.check();
        this.dispatcher.createApplicationContext();
        this.session = this.dispatcher.createSessionContext();
        this.b = this.dispatcher.createInstanceOnSessionLocal(B, this.session);
    }
    teardown() {
        this.b = null;
        __2.ProviderContainer.instance.delete(__1.Scope.APPLICATION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.SESSION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.REQUEST, 'a');
    }
    value() {
        expect(this.b.getValue()).toBe(100);
    }
    a1() {
        expect(this.b.getA1().getValue()).toBe(100);
    }
    a2() {
        this.dispatcher.applyOnApplicationLocal(this.b, 'setA2');
        expect(this.b.getA2().getValue()).toBe(100);
    }
    a3() {
        expect(this.b.getA3().getValue()).toBe(100);
    }
    a4() {
        expect(this.b.getA4()).toBe(undefined);
    }
    equalA1A2() {
        expect(this.b.getA1()).toBe(this.b.getA2());
    }
    notEqualA1A3() {
        expect(this.b.getA1()).not.toBe(this.b.getA3());
    }
    destroySession() {
        this.dispatcher.destroySessionContext(this.session);
        expect(this.b.getA3().getValue()).toBe(0);
        expect(this.b.getValue()).toBe(0);
    }
    destroyApplication() {
        this.dispatcher.destroyApplicationContext();
        expect(this.b.getA1().getValue()).toBe(0);
        expect(this.b.getA2().getValue()).toBe(0);
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "suiteSetup", null);
__decorate([
    jest_decorators_1.SuiteTeardown,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "teardown", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "value", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "a1", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "a2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "a3", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "a4", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "equalA1A2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "notEqualA1A3", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "destroySession", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionTest.prototype, "destroyApplication", null);
SessionTest = __decorate([
    jest_decorators_1.Suite
], SessionTest);
let RequestTest = class RequestTest {
    suiteSetup() {
        this.dispatcher = __2.NodeDispatcher.create(__2.ProviderContainer.instance, __2.DependencyContainer.instance, new __2.ApplicationContext());
        __2.ProviderContainer.instance.set(__1.Scope.APPLICATION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.SESSION, 'a', () => new A);
        __2.ProviderContainer.instance.set(__1.Scope.REQUEST, 'a', () => new A);
        this.dispatcher.check();
        this.dispatcher.createApplicationContext();
        this.session = this.dispatcher.createSessionContext();
        this.request = this.dispatcher.createRequestContext(this.session);
        this.b = this.dispatcher.createInstanceOnRequestLocal(B, this.session, this.request);
    }
    teardown() {
        this.b = null;
        __2.ProviderContainer.instance.delete(__1.Scope.APPLICATION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.SESSION, 'a');
        __2.ProviderContainer.instance.delete(__1.Scope.REQUEST, 'a');
    }
    value() {
        expect(this.b.getValue()).toBe(100);
    }
    a1() {
        expect(this.b.getA1().getValue()).toBe(100);
    }
    a2() {
        this.dispatcher.applyOnApplicationLocal(this.b, 'setA2');
        expect(this.b.getA2().getValue()).toBe(100);
    }
    a3() {
        expect(this.b.getA3().getValue()).toBe(100);
    }
    a4() {
        this.dispatcher.applyOnRequestLocal(this.b, 'setA4', this.session, this.request);
        expect(this.b.getA4().getValue()).toBe(100);
    }
    equalA1A2() {
        expect(this.b.getA1()).toBe(this.b.getA2());
    }
    notEqualA1A3() {
        expect(this.b.getA1()).not.toBe(this.b.getA3());
    }
    notEqualA1A4() {
        expect(this.b.getA1()).not.toBe(this.b.getA4());
    }
    notEqualA3A4() {
        expect(this.b.getA3()).not.toBe(this.b.getA4());
    }
    destroyRequest() {
        this.dispatcher.destroyRequestContext(this.session, this.request);
        expect(this.b.getA4().getValue()).toBe(0);
        expect(this.b.getValue()).toBe(0);
    }
    destroySession() {
        this.dispatcher.destroySessionContext(this.session);
        expect(this.b.getA3().getValue()).toBe(0);
    }
    destroyApplication() {
        this.dispatcher.destroyApplicationContext();
        expect(this.b.getA1().getValue()).toBe(0);
        expect(this.b.getA2().getValue()).toBe(0);
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "suiteSetup", null);
__decorate([
    jest_decorators_1.SuiteTeardown,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "teardown", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "value", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "a1", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "a2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "a3", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "a4", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "equalA1A2", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "notEqualA1A3", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "notEqualA1A4", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "notEqualA3A4", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "destroyRequest", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "destroySession", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RequestTest.prototype, "destroyApplication", null);
RequestTest = __decorate([
    jest_decorators_1.Suite
], RequestTest);
jest_decorators_1.TestContainer.run();

//# sourceMappingURL=base.test.js.map
