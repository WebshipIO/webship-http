/*

  当 @Injectable 标记 B，而 B 继承自 A 时，如果 B 没有自己的构造函数，则 A 必须使用 @Injectable 标记；否则，将会出现未知错误。

  以下是允许的：
      
      @Injectable
      class A {
        constructor(public m: M, public i: number, public s: string, public a: Array<string>, public o: Object, public j: JSON, public u: undefined, public n: null) {
          
        }

        public abc() {}
      }

      @Injectable
      class B extends A {

        public abc() {}

        public efg() {}
      }

  以下是不允许的：

      class A {
        constructor(public m: M, public i: number, public s: string, public a: Array<string>, public o: Object, public j: JSON, public u: undefined, public n: null) {
          
        }

        public abc() {}
      }

      @Injectable
      class B extends A {
        public abc() {}

        public efg() {}
      }
*/

import { Suite, Test, SuiteSetup, SuiteTeardown, Setup, Teardown, TestContainer } from 'jest-decorators'
import { LDIProvider, Injectable } from './index'

@Injectable
class M {
  private get10(): number {
    return 100
  }

  public get100(): number {
    return 100
  }
}

class A {
  constructor(public m: M) {
  }

  public abc() {}
}

@Injectable
class B extends A {
  public x = 0

  constructor(public m: M, public i: number, public s: string, public a: Array<string>, public o: Object, public j: JSON, public u: undefined, public n: null) {
    super(m)
  }

  public abc() {}

  public efg() {}

  public onCreate() {
    this.x = 100
  }

  public onDestroy() {
    this.x = 0
  }
}

@Suite
class ApplicationTest {
  private b: B

  @SuiteSetup
  private suiteSetup() {
    this.b = LDIProvider.get(B)
  }

  @Test
  private get() {
    expect(this.b.m instanceof M).toBeTruthy()
    expect(typeof this.b.i === 'number').toBeTruthy()
    expect(typeof this.b.s === 'string').toBeTruthy()
    expect(this.b.a instanceof Array).toBeTruthy()
    expect(typeof this.b.o === 'object' && this.b.o !== null).toBeTruthy()
    expect(typeof this.b.j === 'object' && this.b.j !== null).toBeTruthy()
    expect(typeof this.b.u === 'undefined').toBeTruthy()
    expect(typeof this.b.n === 'undefined').toBeTruthy()
    expect(typeof this.b.abc === 'function').toBeTruthy()
    expect(typeof this.b.efg === 'function').toBeTruthy()
    expect(this.b.x).toBe(100)
  }

  @Test
  private destroy() {
    LDIProvider.destroy()
    expect(this.b.x).toBe(0)
  }
}

TestContainer.run()

