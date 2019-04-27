import {ClassType} from './types'  

export type Node<T=any> = ClassType<T>  
export type NodeInstance<T extends Node =any> = InstanceType<T> & NonNullable<Object>

export class NodeInstanceContainer<T extends Node=any> {
  private map: Map<Node<T>, NodeInstance<T> | Set<NodeInstance<T>>> = new Map()

  public add(node: Node<T>, instance: NodeInstance<T>): this {
    if (this.map.has(node)) {
      let value = this.map.get(node)
      if (value instanceof Set) {
        value.add(instance)
      } else {
        this.map.set(node, new Set())
        ;(this.map.get(node) as Set<NodeInstance<T>>).add(value)
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
        for (let a of value) {
          yield [key, a]
        }
      } else {
        yield [key, value]
      }
    }
  }
}





