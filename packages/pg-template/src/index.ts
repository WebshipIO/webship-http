import * as PostgresFormat from 'pg-format'
import {Pool, PoolClient, Connection, QueryResult} from 'pg'

export interface Repository {
  readonly pool: Pool
}

export type RepositoryClass = new(...args: Array<any>) => Repository

export type QueryType = 'Query' | 'PureQuery' | 'MultipleQuery' | 'Transcation'

export interface QueryProperties {
  type: QueryType
  sql: string
  fn: (...args: Array<any>) => any
  filter: (r: QueryResult | ReadonlyArray<QueryResult>) => any
}

export class PgTemplateContainer extends Map<RepositoryClass, Map<PropertyKey, QueryProperties>> {
  private static sInstance: PgTemplateContainer

  public static get instance(): PgTemplateContainer {
    if (PgTemplateContainer.sInstance === undefined) {
      PgTemplateContainer.sInstance = new PgTemplateContainer()
    }
    return PgTemplateContainer.sInstance
  }

  public transform() {
    for (let [classType, map] of super.entries()) {
      for (let [key, value] of map.entries()) {
        if (typeof value.sql === 'string') {
          switch (value.type) {
          case 'Query':
            value.fn = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: async function (...args: any[]) {
                let result = await this.pool.query(PostgresFormat.withArray(value.sql, args))
                return typeof value.filter === 'function' ? value.filter(result) : result
              }
            })
            break
          case 'PureQuery':
            value.fn = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: function (...args: any[]) {
                return async function (c: PoolClient) {
                  let result = await c.query(PostgresFormat.withArray(value.sql, args))
                  return typeof value.filter === 'function' ? value.filter(result) : result
                }
              }
            })
            break
          case 'MultipleQuery':
            value.fn = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: async function (...args: any[]) {
                let connection = await this.pool.connect()
                let result: Array<QueryResult> = []
                let sqls = PostgresFormat.withArray(value.sql, args).split(';').filter(x => x.trim().length > 0)
                try {
                  for (let s of sqls) {
                    let a = await connection.query(s)
                    result.push(a)
                  }
                } catch (e) {
                  throw e
                } finally {
                  connection.release()
                }
                return typeof value.filter === 'function' ? value.filter(result) : result
              }
            })
            break
          case 'Transcation':
            value.fn = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: async function (...args: any[]) {
                let connection = await this.pool.connect()
                let result: Array<QueryResult> = []
                let sqls = PostgresFormat.withArray(value.sql, args).split(';').filter(x => x.trim().length > 0)
                try {
                  await connection.query('BEGIN')
                  for (let s of sqls) {
                    let a = await connection.query(s)
                    result.push(a)
                  }
                  await connection.query('COMMIT')
                } catch (e) {
                  await connection.query('ROLLBACK')
                  throw e
                } finally {
                  connection.release()
                }
                return typeof value.filter === 'function' ? value.filter(result) : result
              }
            })
            break
          }
        }
      }
    }
  }

  public untransform() {
    for (let [classType, map] of super.entries()) {
      for (let [key, value] of map.entries()) {
        if (typeof value.sql === 'string') {
          switch (value.type) {
          case 'Query':
          case 'PureQuery': 
          case 'MultipleQuery':
          case 'Transcation':
            Reflect.defineProperty(classType.prototype, key, {
              value: value.fn
            })
            break
          }
        }
      }
    }
  }
}

export function Query(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'Query',
        sql: sql,
        fn: null,
        filter: null
      })
    } else {
      PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function PureQuery(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'PureQuery',
        sql: sql,
        fn: null,
        filter: null
      })
    } else {
      PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function QueryFilter<T>(filter: (r: QueryResult) => T): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'Query',
        sql: null,
        fn: null,
        filter: filter
      })
    } else {
      PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter
    }
  }
}

export function MultipleQuery(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'MultipleQuery',
        sql: sql,
        fn: null,
        filter: null
      })
    } else {
      PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function MultipleQueryFilter<T>(filter: (r: ReadonlyArray<QueryResult>) => T): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'MultipleQuery',
        sql: null,
        fn: null,
        filter: filter
      })
    }
    PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter
  }
}

export function Transaction(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'Transcation',
        sql: sql,
        fn: null,
        filter: null
      })
    } else {
      PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function TransactionFilter<T>(filter: (r: ReadonlyArray<QueryResult>) => T): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
      PgTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'Transcation',
        sql: null,
        fn: null,
        filter: filter
      })
    }
    PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter
  }
}

