import 'reflect-metadata'

export type ClassType<T=any> = new(...args: Array<any>) => T

const dependencyContainer: Map<ClassType, {
  args: Array<any>
}> = new Map()

const instanceContainer: Map<ClassType, object> = new Map()

export function Injectable<T extends ClassType>(t: T): T {
// 类装饰器，标记类 ``t`` 为一个 LDI 依赖。
  const args = Reflect.getMetadata('design:paramtypes', t)

  if (args === undefined && Reflect.getPrototypeOf(t) instanceof Function) {
    throw new Error(`cannot found a valid constructor of 'class ${t.name}'`)
  }

  dependencyContainer.set(t, {
    args: args
  })
  return t
}

export class LDIProvider {
  public static get<T>(t: ClassType<T>): T {
  // 根据 ``t`` 获取实例容器内保存的实例。如果没有，就创建一个新的实例；如果依赖容器内没有
  // ``t`` 的映射，则抛出一个异常。
    let instance: T
    if (instanceContainer.has(t)) {
      instance = instanceContainer.get(t) as any
    } else if (dependencyContainer.has(t)) {
      const dep = dependencyContainer.get(t)
      const params: Array<any> = []
      if (dep.args instanceof Array) {
        for (let arg of dep.args) {
          let param: any
          if (arg === Number) {
            param = 0
          } else if (arg === String) {
            param = ''
          } else if (arg === Boolean) {
            param = true
          } else if (arg === null) {
            param = undefined
          } else if (arg === undefined) {
            param = undefined
          } else if (arg === Array) {
            param = []
          } else if (arg === Object) {
            param = Object.create(null)
          } else {
            // TODO: 优化这个算法，把递归转换为循环
            param = LDIProvider.get(arg)
          }
          params.push(param)
        }
      }
      instance = new t(...params)
      instanceContainer.set(t, instance as any)
      if (typeof (instance as any).onCreate === 'function') {
        (instance as any).onCreate()
      }
    } else {
      throw new Error(`not found 'class ${t.name}' in instance container`)
    }
    return instance
  }

  public static set<T>(t: ClassType<T>, instance: object) {
  // 设置 ``t`` 的实例。
    instanceContainer.set(t, instance)
  }

  public static destroy() {
  // 销毁所有实例容器内部保存的实例。
    for (let instance of instanceContainer.values()) {
      if (typeof (instance as any).onDestroy === 'function') {
        (instance as any).onDestroy()
      }
    }
    instanceContainer.clear()
  }
}

