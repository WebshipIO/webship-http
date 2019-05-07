import {Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer} from 'jest-decorators'
import {Scope, ApplicationScope, SessionScope, RequestScope} from '..'
import {ProviderContainer, DependencyContainer, Context, NodeDispatcher} from '..'

class A {
  private value: number = 100 

  public getValue(): number {
    return this.value
  }

  protected onDestroy() {
    this.value = 0
  }
}

class B {
  private a2: A
  private a4: A
  private value: number = 100

  constructor(
    @ApplicationScope('a') private a1: A,
    @SessionScope    ('a') private a3: A
  ) {
  }

  public getA1() {
    return this.a1
  }

  public getA2() {
    return this.a2
  }

  public getA3() {
    return this.a3
  }

  public getA4() {
    return this.a4
  }

  public setA2(@ApplicationScope('a') a: A) {
    this.a2 = a
  }

  public setA4(@RequestScope('a') a: A) {
    this.a4 = a
  }

  public getValue(): number {
    return this.value
  }

  protected onDestroy() {
    this.value = 0
  }
}

@Suite
class ApplicationTest {
  private b: B
  private dispatcher: NodeDispatcher

  @SuiteSetup
  private async setupProviders() {
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
  }

  @SuiteSetup
  private async setupDispatcher() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.b = await this.dispatcher.createNodeOfApplicationContext(B)
  }

  @SuiteTeardown
  private teardownDispatcher() {
    this.b = null
  }

  @SuiteTeardown
  private teardownProviders() {
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
    ProviderContainer.instance.delete(Scope.SESSION,     'a')
    ProviderContainer.instance.delete(Scope.REQUEST,     'a')
  }

  @Test
  private value() {
    expect(this.b.getValue()).toBe(100)
  }

  @Test
  private a1() {
    expect(this.b.getA1().getValue()).toBe(100)
  }

  @Test
  private a2() {
    this.dispatcher.applyOfApplicationContext(this.b, 'setA2')
    expect(this.b.getA2().getValue()).toBe(100)
  }

  @Test
  private a3() {
    expect(this.b.getA3()).toBe(undefined)
  }

  @Test
  private a4() {
    expect(this.b.getA4()).toBe(undefined)
  }

  @Test
  private equalA1A2() {
    expect(this.b.getA1()).toBe(this.b.getA2())
  }

  @Test
  private async destroy() {
    await this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }
}

@Suite
class SessionTest {
  private b: B
  private session: Context
  private dispatcher: NodeDispatcher

  @SuiteSetup
  private async setupProviders() {
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
  }

  @SuiteSetup
  private async setupDispatcher() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.session = await this.dispatcher.createSessionContext()
    this.b = await this.dispatcher.createNodeOfSessionContext(B, this.session)
  }

  @SuiteTeardown
  private teardownDispatcher() {
    this.b = null
  }

  @SuiteTeardown
  private teardownProviders() {
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
    ProviderContainer.instance.delete(Scope.SESSION,     'a')
    ProviderContainer.instance.delete(Scope.REQUEST,     'a')
  }

  @Test
  private value() {
    expect(this.b.getValue()).toBe(100)
  }

  @Test
  private a1() {
    expect(this.b.getA1().getValue()).toBe(100)
  }

  @Test
  private a2() {
    this.dispatcher.applyOfApplicationContext(this.b, 'setA2')
    expect(this.b.getA2().getValue()).toBe(100)
  }

  @Test
  private a3() {
    expect(this.b.getA3().getValue()).toBe(100)
  }

  @Test
  private a4() {
    expect(this.b.getA4()).toBe(undefined)
  }

  @Test
  private equalA1A2() {
    expect(this.b.getA1()).toBe(this.b.getA2())
  }

  @Test
  private notEqualA1A3() {
    expect(this.b.getA1()).not.toBe(this.b.getA3())
  }

  @Test
  private async destroySession() {
    await this.dispatcher.destroySessionContext(this.session) 
    expect(this.b.getA3().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }

  @Test
  private async destroyApplication() {
    await this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
  }
}

@Suite
class RequestTest {
  private b: B
  private session: Context
  private request: Context
  private dispatcher: NodeDispatcher

  @SuiteSetup
  private async setupProviders() {
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
  }

  @SuiteSetup
  private async setupDispatcher() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.session = await this.dispatcher.createSessionContext()
    this.request = await this.dispatcher.createRequestContext(this.session)
    this.b = await this.dispatcher.createNodeOfRequestContext(B, this.request)
  }

  @SuiteTeardown
  private teardownDispatcher() {
    this.b = null
  }

  @SuiteTeardown
  private teardownProviders() {
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
    ProviderContainer.instance.delete(Scope.SESSION,     'a')
    ProviderContainer.instance.delete(Scope.REQUEST,     'a')
  }

  @Test
  private value() {
    expect(this.b.getValue()).toBe(100)
  }

  @Test
  private a1() {
    expect(this.b.getA1().getValue()).toBe(100)
  }

  @Test
  private a2() {
    this.dispatcher.applyOfApplicationContext(this.b, 'setA2')
    expect(this.b.getA2().getValue()).toBe(100)
  }

  @Test
  private a3() {
    expect(this.b.getA3().getValue()).toBe(100)
  }

  @Test
  private a4() {
    this.dispatcher.applyOfRequestContext(this.b, 'setA4', this.request)
    expect(this.b.getA4().getValue()).toBe(100)
  }

  @Test
  private equalA1A2() {
    expect(this.b.getA1()).toBe(this.b.getA2())
  }

  @Test
  private notEqualA1A3() {
    expect(this.b.getA1()).not.toBe(this.b.getA3())
  }

  @Test
  private notEqualA1A4() {
    expect(this.b.getA1()).not.toBe(this.b.getA4())
  }

  @Test
  private notEqualA3A4() {
    expect(this.b.getA3()).not.toBe(this.b.getA4())
  }

  @Test
  private async destroyRequest() {
    await this.dispatcher.destroyRequestContext(this.request) 
    expect(this.b.getA4().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }

  @Test
  private async destroySession() {
    await this.dispatcher.destroySessionContext(this.session) 
    expect(this.b.getA3().getValue()).toBe(0)
  }

  @Test
  private async destroyApplication() {
    await this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
  }
}

TestContainer.run()

