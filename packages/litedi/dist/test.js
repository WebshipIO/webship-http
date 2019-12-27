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
Object.defineProperty(exports, "__esModule", { value: true });
const jest_decorators_1 = require("jest-decorators");
const index_1 = require("./index");
let M = class M {
    get10() {
        return 100;
    }
    get100() {
        return 100;
    }
};
M = __decorate([
    index_1.Injectable
], M);
class A {
    constructor(m) {
        this.m = m;
    }
    abc() { }
}
let B = class B extends A {
    constructor(m, i, s, a, o, j, u, n) {
        super(m);
        this.m = m;
        this.i = i;
        this.s = s;
        this.a = a;
        this.o = o;
        this.j = j;
        this.u = u;
        this.n = n;
        this.x = 0;
    }
    abc() { }
    efg() { }
    onCreate() {
        this.x = 100;
    }
    onDestroy() {
        this.x = 0;
    }
};
B = __decorate([
    index_1.Injectable,
    __metadata("design:paramtypes", [M, Number, String, Array, Object, Object, void 0, void 0])
], B);
let ApplicationTest = class ApplicationTest {
    suiteSetup() {
        this.b = index_1.LDIProvider.get(B);
    }
    get() {
        expect(this.b.m instanceof M).toBeTruthy();
        expect(typeof this.b.i === 'number').toBeTruthy();
        expect(typeof this.b.s === 'string').toBeTruthy();
        expect(this.b.a instanceof Array).toBeTruthy();
        expect(typeof this.b.o === 'object' && this.b.o !== null).toBeTruthy();
        expect(typeof this.b.j === 'object' && this.b.j !== null).toBeTruthy();
        expect(typeof this.b.u === 'undefined').toBeTruthy();
        expect(typeof this.b.n === 'undefined').toBeTruthy();
        expect(typeof this.b.abc === 'function').toBeTruthy();
        expect(typeof this.b.efg === 'function').toBeTruthy();
        expect(this.b.x).toBe(100);
    }
    destroy() {
        index_1.LDIProvider.destroy();
        expect(this.b.x).toBe(0);
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "suiteSetup", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "get", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ApplicationTest.prototype, "destroy", null);
ApplicationTest = __decorate([
    jest_decorators_1.Suite
], ApplicationTest);
jest_decorators_1.TestContainer.run();

//# sourceMappingURL=test.js.map
