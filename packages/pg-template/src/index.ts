import * as PostgresFormat from 'pg-format'
import {Pool, Connection, QueryResult} from 'pg'

export abstract class Repository {
  constructor(protected pool: Pool) {
  }
}

export type RepositoryClass = new(...args: Array<any>) => Repository

export interface QueryProperties {
  type: 'query'
  sql?: string
  filter?: (r: QueryResult) => any
}

export interface TransactionProperties {
  type: 'transcation'
  sql?: string
  filter?: (r: ReadonlyArray<QueryResult>) => any
}

export class SQLTemplateContainer extends Map<RepositoryClass, Map<PropertyKey, QueryProperties | TransactionProperties>> {
  private static sInstance: SQLTemplateContainer

  public static get instance(): SQLTemplateContainer {
    if (SQLTemplateContainer.sInstance === undefined) {
      SQLTemplateContainer.sInstance = new SQLTemplateContainer()
    }
    return SQLTemplateContainer.sInstance
  }


  public transform() {
    for (let [classType, map] of super.entries()) {
      for (let [key, value] of map.entries()) {
        switch (value.type) {
        case 'query':
          if (typeof value.sql === 'string') {
            var f = Reflect.get(classType.prototype, key)
            Reflect.defineProperty(classType.prototype, key, {
              value: async function (...args: any[]) {
                let result = await this.pool.query(PostgresFormat.withArray((value as QueryProperties).sql, args))
                return typeof value.filter === 'function' ? value.filter(result) : result
              }
            })
          }
          break
        case 'transcation':
          if (typeof value.sql === 'string') {
            var f = Reflect.get(classType.prototype, key)
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
                return typeof value.filter === 'function' ? (value as TransactionProperties).filter(result) : result
              }
            })
          }
          break
        }
      }
    }
  }
}

export function Query(sql: string): PropertyDecorator {
  return function (target: Repository, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!SQLTemplateContainer.instance.has(classType)) {
      SQLTemplateContainer.instance.set(classType, new Map())
    }
    if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
      SQLTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'query',
        sql: sql
      })
    } else {
      SQLTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function QueryFilter<T>(filter: (r: QueryResult) => T): PropertyDecorator {
  return function (target: Object, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!SQLTemplateContainer.instance.has(classType)) {
      SQLTemplateContainer.instance.set(classType, new Map())
    }
    if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
      SQLTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'query',
        filter: filter
      })
    } else {
      SQLTemplateContainer.instance.get(classType).get(propertyKey).filter = filter
    }
  }
}

export function Transaction(sql: string): PropertyDecorator {
  return function (target: Object, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!SQLTemplateContainer.instance.has(classType)) {
      SQLTemplateContainer.instance.set(classType, new Map())
    }
    if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
      SQLTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'transcation',
        sql: sql
      })
    } else {
      SQLTemplateContainer.instance.get(classType).get(propertyKey).sql = sql
    }
  }
}

export function TransactionFilter<T>(filter: (r: ReadonlyArray<QueryResult>) => T): PropertyDecorator {
  return function (target: Object, propertyKey: PropertyKey) {
    let classType = target.constructor as RepositoryClass
    if (!SQLTemplateContainer.instance.has(classType)) {
      SQLTemplateContainer.instance.set(classType, new Map())
    }
    if (!SQLTemplateContainer.instance.get(classType).has(propertyKey)) {
      SQLTemplateContainer.instance.get(classType).set(propertyKey, {
        type: 'transcation',
        filter: filter
      })
    } else {
      SQLTemplateContainer.instance.get(classType).get(propertyKey).filter = filter
    }
  }
}
