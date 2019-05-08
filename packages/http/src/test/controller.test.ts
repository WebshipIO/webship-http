import * as request from 'request-promise'
import {Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer} from 'jest-decorators'
import {ApplicationScope, SessionScope, RequestScope, Scope, ProviderContainer} from '@webnode/cdi'
import {HttpServer, ServerRequest, ServerResponse, RePathnameParams} from '..'
import {Controller, Get, Post, Put, Delete, Head, Options, Trace, Connect} from '..'
import {ParameterMapping, Req, Res, Url, Headers, Params, Query, ReqBody} from '..'
import {RequestLifecycle, RequestStart, RequestEnd, RequestError} from '..'

interface UpdateBody {
  value: number
}

interface TraceBody {
  value: number
}

@Controller
class Home {
  @Post('/')
  private create(@Res res: ServerResponse) {
    res.status = 201
  }

  @Get('/:id')
  private get(@Res res: ServerResponse, @Params params: RePathnameParams) {
    res.body = {id: parseInt(params.id)}
  }

  @Put('/:id/value')
  private update(@Res res: ServerResponse, @Params params: RePathnameParams, @ReqBody body: UpdateBody) {
    res.body = {value: body.value}
  }

  @Delete('/:id')
  private delete(@Res res: ServerResponse, @Params params: RePathnameParams) {
    res.body = {id: 0}
  }

  @Head('/')
  private head(@Res res: ServerResponse, @Params params: RePathnameParams) {
    res.status = 204
  }

  @Options('/')
  private options(@Res res: ServerResponse, @Params params: RePathnameParams) {
    res.setHeader('Accept-Language', 'en-us')
  }

  @Trace('/')
  private trace(@Res res: ServerResponse, @Params params: RePathnameParams, @ReqBody body: TraceBody) {
    res.body = body
  }
}

@Suite
class ServerTest {
  private app: HttpServer
  private port: number

  @SuiteSetup
  private async setup() {
    this.app = HttpServer.create()
    await this.app.serve()
    this.port = this.app.address().port
  }

  @SuiteTeardown
  private async teardown() {
    await this.app.close()
  }

  @Test
  private async create() {
    let res = await request.post(`http://127.0.0.1:${this.port}/`, {resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(201)
  }

  @Test
  private async get() {
    let res = await request.get(`http://127.0.0.1:${this.port}/1`, {resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(200)
    expect(res.body.id).toBe(1)
  }

  @Test
  private async update() {
    let res = await request.put(`http://127.0.0.1:${this.port}/1/value`, {body: {value: 100}, resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(200)
    expect(res.body.value).toBe(100)
  }

  @Test
  private async delete() {
    let res = await request.delete(`http://127.0.0.1:${this.port}/1`, {resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(200)
    expect(res.body.id).toBe(0)
  }

  @Test
  private async head() {
    let res = await request.head(`http://127.0.0.1:${this.port}/`, {resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(204)
  }

  @Test
  private async options() {
    let res = await request({method: 'OPTIONS', url: `http://127.0.0.1:${this.port}/`, resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(200)
    expect(res.headers['accept-language']).toBe('en-us')
  }

  @Test
  private async trace() {
    let res = await request({method: 'TRACE', url: `http://127.0.0.1:${this.port}/`, body: {value: 100}, resolveWithFullResponse: true, json: true})
    expect(res.statusCode).toBe(200)
    expect(res.body.value).toBe(100)
  }
}

TestContainer.run()