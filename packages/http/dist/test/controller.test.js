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
const jest_decorators_1 = require("jest-decorators");
const __1 = require("..");
const __2 = require("..");
const __3 = require("..");
let Home = class Home {
    create(res) {
        res.status = 201;
    }
    get(res, params) {
        res.body = { id: parseInt(params.id) };
    }
    update(res, params, body) {
        res.body = { value: body.value };
    }
    delete(res, params) {
        res.body = { id: 0 };
    }
    head(res, params) {
        res.status = 204;
    }
    options(res, params) {
        res.setHeader('Accept-Language', 'en-us');
    }
    trace(res, params, body) {
        res.body = body;
    }
};
__decorate([
    __2.Post('/'),
    __param(0, __3.Res),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "create", null);
__decorate([
    __2.Get('/:id'),
    __param(0, __3.Res), __param(1, __3.Params),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "get", null);
__decorate([
    __2.Put('/:id/value'),
    __param(0, __3.Res), __param(1, __3.Params), __param(2, __3.ReqBody),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "update", null);
__decorate([
    __2.Delete('/:id'),
    __param(0, __3.Res), __param(1, __3.Params),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "delete", null);
__decorate([
    __2.Head('/'),
    __param(0, __3.Res), __param(1, __3.Params),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "head", null);
__decorate([
    __2.Options('/'),
    __param(0, __3.Res), __param(1, __3.Params),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "options", null);
__decorate([
    __2.Trace('/'),
    __param(0, __3.Res), __param(1, __3.Params), __param(2, __3.ReqBody),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], Home.prototype, "trace", null);
Home = __decorate([
    __2.Controller
], Home);
let ServerTest = class ServerTest {
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app = __1.HttpServer.create();
            yield this.app.serve();
            this.port = this.app.address().port;
        });
    }
    teardown() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.close();
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.post(`http://127.0.0.1:${this.port}/`, { resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(201);
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.get(`http://127.0.0.1:${this.port}/1`, { resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(1);
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.put(`http://127.0.0.1:${this.port}/1/value`, { body: { value: 100 }, resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(200);
            expect(res.body.value).toBe(100);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.delete(`http://127.0.0.1:${this.port}/1`, { resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(200);
            expect(res.body.id).toBe(0);
        });
    }
    head() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request.head(`http://127.0.0.1:${this.port}/`, { resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(204);
        });
    }
    options() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request({ method: 'OPTIONS', url: `http://127.0.0.1:${this.port}/`, resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(200);
            expect(res.headers['accept-language']).toBe('en-us');
        });
    }
    trace() {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield request({ method: 'TRACE', url: `http://127.0.0.1:${this.port}/`, body: { value: 100 }, resolveWithFullResponse: true, json: true });
            expect(res.statusCode).toBe(200);
            expect(res.body.value).toBe(100);
        });
    }
};
__decorate([
    jest_decorators_1.SuiteSetup,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "setup", null);
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
], ServerTest.prototype, "create", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "get", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "update", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "delete", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "head", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "options", null);
__decorate([
    jest_decorators_1.Test,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerTest.prototype, "trace", null);
ServerTest = __decorate([
    jest_decorators_1.Suite
], ServerTest);
jest_decorators_1.TestContainer.run();

//# sourceMappingURL=controller.test.js.map
