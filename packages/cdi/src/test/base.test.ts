import {Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer} from 'jest-decorators'
import {Scope, ApplicationScope, SessionScope, RequestScope, SessionIdentifier} from '..'
import {ProviderContainer, DependencyContainer, ApplicationContext, NodeDispatcher} from '..'

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
  private suiteSetup() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance, new ApplicationContext())
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.b = this.dispatcher.createInstanceOnApplicationLocal(B)
  }

  @SuiteTeardown
  private teardown() {
    this.b = null
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
    this.dispatcher.applyOnApplicationLocal(this.b, 'setA2')
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
  private destroy() {
    this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }
}

@Suite
class SessionTest {
  private b: B
  private session: SessionIdentifier
  private dispatcher: NodeDispatcher

  @SuiteSetup
  private suiteSetup() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance, new ApplicationContext())
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.session = this.dispatcher.createSessionContext()
    this.b = this.dispatcher.createInstanceOnSessionLocal(B, this.session)
  }

  @SuiteTeardown
  private teardown() {
    this.b = null
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
    this.dispatcher.applyOnApplicationLocal(this.b, 'setA2')
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
  private destroySession() {
    this.dispatcher.destroySessionContext(this.session) 
    expect(this.b.getA3().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }

  @Test
  private destroyApplication() {
    this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
  }
}

@Suite
class RequestTest {
  private b: B
  private session: SessionIdentifier
  private request: SessionIdentifier
  private dispatcher: NodeDispatcher

  @SuiteSetup
  private suiteSetup() {
    this.dispatcher = NodeDispatcher.create(
      ProviderContainer.instance, DependencyContainer.instance, new ApplicationContext())
    ProviderContainer.instance.set(Scope.APPLICATION, 'a', () => new A)
    ProviderContainer.instance.set(Scope.SESSION,     'a', () => new A)
    ProviderContainer.instance.set(Scope.REQUEST,     'a', () => new A)
    this.dispatcher.check()
    this.dispatcher.createApplicationContext()
    this.session = this.dispatcher.createSessionContext()
    this.request = this.dispatcher.createRequestContext(this.session)
    this.b = this.dispatcher.createInstanceOnRequestLocal(B, this.session, this.request)
  }

  @SuiteTeardown
  private teardown() {
    this.b = null
    ProviderContainer.instance.delete(Scope.APPLICATION, 'a')
    ProviderContainer.instance.delete(Scope.SESSION, 'a')
    ProviderContainer.instance.delete(Scope.REQUEST, 'a')
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
    this.dispatcher.applyOnApplicationLocal(this.b, 'setA2')
    expect(this.b.getA2().getValue()).toBe(100)
  }

  @Test
  private a3() {
    expect(this.b.getA3().getValue()).toBe(100)
  }

  @Test
  private a4() {
    this.dispatcher.applyOnRequestLocal(this.b, 'setA4', this.session, this.request)
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
  private destroyRequest() {
    this.dispatcher.destroyRequestContext(this.session, this.request) 
    expect(this.b.getA4().getValue()).toBe(0)
    expect(this.b.getValue()).toBe(0)
  }

  @Test
  private destroySession() {
    this.dispatcher.destroySessionContext(this.session) 
    expect(this.b.getA3().getValue()).toBe(0)
  }

  @Test
  private destroyApplication() {
    this.dispatcher.destroyApplicationContext()
    expect(this.b.getA1().getValue()).toBe(0)
    expect(this.b.getA2().getValue()).toBe(0)
  }
}

TestContainer.run()

