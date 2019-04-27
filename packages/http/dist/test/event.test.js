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
const __4 = require("..");
class A {
    constructor() {
        this.requestStartValue = 0;
        this.requestEndValue = 0;
    }
}
let a = Object.create(null);
let DefaultConnectionLifecycle = class DefaultConnectionLifecycle {
    requestStart() {
        a.requestStartValue = 100;
    }
    requestEnd() {
        a.requestEndValue = 100;
    }
    requestError() {
    }
};
__decorate([
    __4.RequestStart,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DefaultConnectionLifecycle.prototype, "requestStart", null);
__decorate([
    __4.RequestEnd,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DefaultConnectionLifecycle.prototype, "requestEnd", null);
__decorate([
    __4.RequestError,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DefaultConnectionLifecycle.prototype, "requestError", null);
DefaultConnectionLifecycle = __decorate([
    __4.RequestLifecycle
], DefaultConnectionLifecycle);
let Home = class Home {
    getA(res, a) {
        res.body = {
            a: a
        };
    }
};
__decorate([
    __2.Get('/'),
    __param(0, __3.Res()),
    __param(1, cdi_1.ApplicationScope('a')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [__1.ServerResponse,
        A]),
    __metadata("design:returntype", void 0)
], Home.prototype, "getA", null);
Home = __decorate([
    __2.Controller
], Home);
let ServerTest = class ServerTest {
    suiteSetup() {
        return __awaiter(this, void 0, void 0, function* () {
            cdi_1.ProviderContainer.instance.set(cdi_1.Scope.APPLICATION, 'a', () => new A);
            this.agent = new http_1.Agent({ keepAlive: true });
            this.app = __1.HttpServer.create({ keepAliveTimeout: 1000 });
            yield this.app.serve();
            this.port = this.app.address().port;
        });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.close();
            this.agent.destroy();
            cdi_1.ProviderContainer.instance.delete(cdi_1.Scope.APPLICATION, 'a');
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.get(`http://127.0.0.1:${this.port}/`, {
                resolveWithFullResponse: true,
                json: true,
                agent: this.agent
            });
            expect(a.requestStartValue).toBe(100);
            expect(a.requestEndValue).toBe(100);
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

//# sourceMappingURL=event.test.js.map
