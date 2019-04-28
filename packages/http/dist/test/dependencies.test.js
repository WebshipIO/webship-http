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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const http_1 = require("http");
const jest_decorators_1 = require("jest-decorators");
const cdi_1 = require("@webnode/cdi");
const __1 = require("..");
const __2 = require("..");
const __3 = require("..");
class A {
    constructor() {
        this.value = 0;
    }
}
let Home = class Home {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    getApp(res) {
        if (this.a !== undefined) {
            this.a.value = 100;
        }
        if (this.b !== undefined) {
            this.b.value = 100;
        }
        if (this.c !== undefined) {
            this.c.value = 100;
        }
    }
    get(res) {
        res.body = {
            a: this.a,
            b: this.b,
            c: this.c
        };
    }
};
__decorate([
    __2.Get('/app'),
    __param(0, __3.Res),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [__1.ServerResponse]),
    __metadata("design:returntype", void 0)
], Home.prototype, "getApp", null);
__decorate([
    __2.Get('/'),
    __param(0, __3.Res),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [__1.ServerResponse]),
    __metadata("design:returntype", void 0)
], Home.prototype, "get", null);
Home = __decorate([
    __2.Controller,
    __param(0, cdi_1.ApplicationScope('a')),
    __param(1, cdi_1.SessionScope('a')),
    __param(2, cdi_1.RequestScope('a')),
    __metadata("design:paramtypes", [A,
        A,
        A])
], Home);
let ServerTest = class ServerTest {
    suiteSetup() {
        return __awaiter(this, void 0, void 0, function* () {
            cdi_1.ProviderContainer.instance.set(cdi_1.Scope.APPLICATION, 'a', () => new A);
            cdi_1.ProviderContainer.instance.set(cdi_1.Scope.SESSION, 'a', () => new A);
            cdi_1.ProviderContainer.instance.set(cdi_1.Scope.REQUEST, 'a', () => new A);
            this.agent = new http_1.Agent({ keepAlive: true });
            this.app = __1.HttpServer.create();
            yield this.app.serve();
            this.port = this.app.address().port;
        });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.close();
            this.agent.destroy();
            cdi_1.ProviderContainer.instance.delete(cdi_1.Scope.APPLICATION, 'a');
            cdi_1.ProviderContainer.instance.delete(cdi_1.Scope.SESSION, 'a');
            cdi_1.ProviderContainer.instance.delete(cdi_1.Scope.REQUEST, 'a');
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            yield request.get(`http://127.0.0.1:${this.port}/app`, { resolveWithFullResponse: true, json: true, agent: this.agent });
            let res = yield request.get(`http://127.0.0.1:${this.port}/`, { resolveWithFullResponse: true, json: true, agent: this.agent });
            expect(res.body.a.value).toBe(100);
            expect(res.body.b.value).toBe(100);
            expect(res.body.c).toBe(undefined);
        });
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "suiteSetup", null);
__decorate([
    jest_decorators_1.SuiteTeardown,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "teardown", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "get", null);
ServerTest = __decorate([
    jest_decorators_1.Suite
], ServerTest);
jest_decorators_1.TestContainer.run();

//# sourceMappingURL=dependencies.test.js.map
