import * as PostgresFormat from 'pg-format'
import {Pool, PoolClient, Connection, QueryResult} from 'pg'

export interface Repository {
  readonly pool: Pool
}

export type RepositoryClass = new(...args: Array<any>) => Repository

export type QueryType = 'Query' | 'PureQuery' | 'TransactionQuery'

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
          case 'TransactionQuery':
            value.fn = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: async function (...args: any[]) {
                let connection = await this.pool.connect()
                let result: QueryResult | Array<QueryResult>
                try {
                  await connection.query('BEGIN')
                  result = await connection.query(PostgresFormat.withArray(value.sql, args))
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
          case 'TransactionQuery':
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
    let c = PgTemplateContainer.instance.get(classType)
    if (!c.has(propertyKey)) {
      c.set(propertyKey, Object.create(null))
    } 
    c.get(propertyKey).type = 'Query'
    c.get(propertyKey).sql = sql
  }
}

export function PureQuery(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    let c = PgTemplateContainer.instance.get(classType)
    if (!c.has(propertyKey)) {
      c.set(propertyKey, Object.create(null))
    } 
    c.get(propertyKey).type = 'PureQuery'
    c.get(propertyKey).sql = sql
  }
}

export function TransactionQuery(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    let c = PgTemplateContainer.instance.get(classType)
    if (!c.has(propertyKey)) {
      c.set(propertyKey, Object.create(null))
    } 
    c.get(propertyKey).type = 'TransactionQuery'
    c.get(propertyKey).sql = sql
  }
}

export function QueryFilter<T>(filter: (r: QueryResult | Array<QueryResult>) => T): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!PgTemplateContainer.instance.has(classType)) {
      PgTemplateContainer.instance.set(classType, new Map())
    }
    let c = PgTemplateContainer.instance.get(classType)
    if (!c.has(propertyKey)) {
      c.set(propertyKey, Object.create(null))
    } 
    c.get(propertyKey).filter = filter
  }
}
