/*
  这个模块定义了 Node 。和其他依赖注入或者 IOC 框架不同，在 webnode CDI 中，依赖注入受到严格的控制。只有
  标记为 Node 的类才会执行依赖注入。这样做是为了将依赖注入的影响减小到最小范围，以提供更好的性能和可维护性，
  因为，大多数时候你只需要为类似 root 之类的类注入依赖。
*/

import {ClassType} from './types'  

export type Node<T = any> = ClassType<T>  
export type NodeInstance<T extends Node = any> = InstanceType<T> & NonNullable<Object>

export class NodeInstanceContainer<T extends Node = any> {
  private map: Map<Node<T>, NodeInstance<T> | Set<NodeInstance<T>>> = new Map()

  public add(node: Node<T>, instance: NodeInstance<T>): this {
    if (this.map.has(node)) {
      let value = this.map.get(node)
      if (value instanceof Set) {
        value.add(instance)
      } else {
        this.map.set(node, new Set().add(value))
      }
    } else {
      this.map.set(node, instance)
    }
    return this
  }

  public get(node: Node<T>): NodeInstance<T> | Set<NodeInstance<T>> {
    return this.map.get(node)
  }

  public has(node: Node<T>): boolean {
    return this.map.has(node)
  }

  public delete(node: Node<T>) {
    this.map.delete(node)
  }

  public clear() {
    this.map.clear()
  }

  public size(): number {
    return this.map.size
  }

  public * values(): Iterable<NodeInstance<T>> {
    for (let value of this.map.values()) {
      if (value instanceof Set) {
        for (let a of value) {
          yield a
        }
      } else {
        yield value
      }
    }
  }

  public * entries(): Iterable<[Node<T>, NodeInstance<T>]> {
    for (let [key, value] of this.map.entries()) {
      if (value instanceof Set) {
        for (let v of value) {
          yield [key, v]
        }
      } else {
        yield [key, value]
      }
    }
  }
}