import * as request from 'request-promise'
import {Agent} from 'http'
import {Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer} from 'jest-decorators'
import {ApplicationScope, SessionScope, RequestScope, Scope, ProviderContainer} from '@webnode/cdi'
import {HttpServer, ServerRequest, ServerResponse, RePathnameParams} from '..'
import {Controller, Get, Post, Put, Delete, Head, Options, Trace, Connect} from '..'
import {ParameterMapping, Req, Res, Url, Headers, Params, Query, ReqBody} from '..'
import {RequestLifecycle, RequestStart, RequestEnd, RequestError} from '..'

class A {
  requestStartValue = 0
  requestEndValue = 0
}

let a = Object.create(null) 

@RequestLifecycle
class DefaultConnectionLifecycle {
  @RequestStart
  private requestStart() {
    a.requestStartValue = 100
  }

  @RequestEnd
  private requestEnd() {
    a.requestEndValue = 100
  }

  @RequestError
  private requestError() {
  }
}

@Controller
class Home {
  @Get('/')
  private getA(
    @Res res: ServerResponse,
    @ApplicationScope('a') a: A
  ) {
    res.body = {
      a: a
    }
  }
}

@Suite
class ServerTest {
  private app: HttpServer
  private port: number
  private agent: Agent

  @SuiteSetup
  private async setup() {
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)

    this.agent = new Agent({keepAlive: true})
    this.app = HttpServer.create({keepAliveTimeout: 1000})
    await this.app.serve()
    this.port = this.app.address().port
  }

  @SuiteTeardown
  private async teardown() {
    await this.app.close()
    this.agent.destroy()
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
  }

  @Test
  private async get() {
    let res = await request.get(`http://127.0.0.1:${this.port}/`, {
      resolveWithFullResponse: true, 
      json: true,
      agent: this.agent
    })
    expect(a.requestStartValue).toBe(100)
    expect(a.requestEndValue).toBe(100)
  }
}

TestContainer.run()