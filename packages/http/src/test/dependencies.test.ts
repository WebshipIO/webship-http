import * as request from 'request-promise'
import {Agent} from 'http'
import {Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer} from 'jest-decorators'
import {ApplicationScope, SessionScope, RequestScope, Scope, ProviderContainer} from '@webnode/cdi'
import {HttpServer, ServerRequest, ServerResponse, RePathnameParams} from '..'
import {Controller, Get, Post, Put, Delete, Head, Options, Trace, Connect} from '..'
import {ParameterMapping, Req, Res, Uri, Headers, Params, Query, ReqBody} from '..'
import {RequestLifecycle, RequestStart, RequestEnd, RequestError} from '..'

class A {
  value = 0
}

@Controller
class Home {
  constructor(
    @ApplicationScope('a') private a: A,
    @SessionScope('a') private b: A,
    @RequestScope('a') private c: A
  ) {
  }

  @Get('/app')
  private getApp(@Res() res: ServerResponse) {
    if (this.a !== undefined) {
      this.a.value = 100
    }
    if (this.b !== undefined) {
      this.b.value = 100
    }
    if (this.c !== undefined) {
      this.c.value = 100
    }
  }

  @Get('/')
  private get(@Res() res: ServerResponse) {
    res.body = {
      a: this.a,
      b: this.b,
      c: this.c
    }
  }
}

@Suite
class ServerTest {
  private app: HttpServer
  private port: number
  private agent: Agent

  @SuiteSetup
  private async suiteSetup() {
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)

    this.agent = new Agent({keepAlive:true})
    this.app = HttpServer.create()
    await this.app.serve()
    this.port = this.app.address().port
  }

  @SuiteTeardown
  private async teardown() {
    await this.app.close()
    this.agent.destroy()
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
    ProviderContainer.instance.delete(Scope.SESSION,     'a')
    ProviderContainer.instance.delete(Scope.REQUEST,     'a')
  }

  @Test
  private async get() {
    await request.get(`http://127.0.0.1:${this.port}/app`, {resolveWithFullResponse: true, json: true, agent: this.agent})
    let res = await request.get(`http://127.0.0.1:${this.port}/`, {resolveWithFullResponse: true, json: true, agent: this.agent})
    expect(res.body.a.value).toBe(100)
    expect(res.body.b.value).toBe(100)
    expect(res.body.c).toBe(undefined)
  }
}

TestContainer.run()