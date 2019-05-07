/*
  只能使用参数绑定依赖，这是因为　TypeScript 无法获取类的成员属性表，当编译后，未赋值的属性会被
  忽略。所以，绑定只能出现在构造函数或者成员方法的参数：

      class Test {
        constructor(
          @ApplicationScope('user') user: User
        ) {
        }

        print(@ApplicationScope('user') user: User) {
  
        }
      }
*/

import {ClassType} from './types'
import {Scope} from './scope'
import {Provider, ProviderInstance, ProviderKey} from './provider'
import {Node} from './node'
import 'reflect-metadata'

export interface Dependency {
  providerKey: ProviderKey
  providerType: ClassType
  scope: Scope
  parameterIndex: number
}

export class DependencyContainer {
  private static sInstance: DependencyContainer

  public static get instance(): DependencyContainer {
    if (DependencyContainer.sInstance === undefined) {
      DependencyContainer.sInstance = new DependencyContainer()
    }
    return DependencyContainer.sInstance
  }
  
  private map: Map<Node, Map<PropertyKey, Array<Dependency>>> = new Map()

  public set<T>(node: Node<T>, propertyKey: PropertyKey, parameterIndex: number, providerKey: ProviderKey, scope: Scope) {
    if (!this.map.has(node)) {
      this.map.set(node, new Map())
    }
    let dependency = {
      providerKey: providerKey,
      providerType: Reflect.getMetadata("design:type", node.prototype, propertyKey as string | symbol),
      scope: scope,
      parameterIndex: parameterIndex
    }
    let submap = this.map.get(node)
    if (!submap.has(propertyKey)) {
      submap.set(propertyKey, [])
    }
    submap.get(propertyKey)[parameterIndex] = dependency
  }

  public get<T>(node: Node<T>, propertyKey: PropertyKey): Array<Dependency> {
    if (this.map.has(node) && this.map.get(node).has(propertyKey)) {
      return this.map.get(node).get(propertyKey)
    }
    return []
  }

  public has<T>(node: Node<T>, propertyKey: PropertyKey): boolean {
    return this.map.has(node) && this.map.get(node).has(propertyKey)
  }

  public delete<T>(node: Node<T>, propertyKey?: PropertyKey) {
    if (this.map.has(node)) {
      if (arguments.length > 1) {
        if (this.map.get(node).has(propertyKey)) {
          this.map.get(node).delete(propertyKey)
        }
      } else {
        this.map.delete(node)
      }
    }
  }

  public clear() {
    this.map.clear()
  }

  public size<T>(node?: Node<T>) {
    if (arguments.length > 1) {
      if (this.map.has(node)) {
        return this.map.get(node).size
      } else {
        return 0
      }
    } else {
      return this.map.size
    }
  }

  public * values<T>(node: Node<T>, propertyKey: PropertyKey): Iterable<Dependency> { 
    // 依赖只关注当前节点本身，而不灌注父类（如果继承的话）
    if (this.map.has(node)) {
      let propertyKeyMap = this.map.get(node)
      if (propertyKeyMap.has(propertyKey)) {
        for (let dependency of propertyKeyMap.get(propertyKey)) {
          if (dependency !== undefined) {
            yield dependency
          }
        }
      }
    }
  }

  public * entries<T>(): Iterable<[Node, PropertyKey, Dependency]> { 
    // 依赖只关注当前节点本身，而不灌注父类（如果继承的话）
    for (let [node, propertyKeyMap] of this.map.entries()) {
      for (let [propertyKey, dependencies] of propertyKeyMap.entries()) {
        for (let dependency of dependencies) {
          if (dependency !== undefined) {
            yield [node, propertyKey, dependency]
          }
        }
      }
    }
  }
}

function * chainClassType(x: ClassType): Iterable<ClassType> {
  // iterate over the inheritance class chain of a class ``x``, including its own class.
  // such as a class chain ``A -|> B -|> C``, return ``A`` ``B`` ``C`` when ``chainClassTypes(A)``
  //
  // Function.__proto__ === Object.__proto__ === Function.prototype
  // C.__proto__        === Function.__proto__ 
  // B.__proto__        === A
  // A.__proto__        === B
  let constructs: Array<ClassType> = [x]
  for (let c of constructs) {
    yield c
    let next = Object.getPrototypeOf(c)
    if (next === Function.prototype) {
      break
    }
    constructs.push(next)
  }
}
