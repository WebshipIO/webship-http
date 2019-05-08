
import Pg = require("pg")
import PgFormat = require("pg-format")

declare namespace WebNode {
  export abstract class Repository {
    protected pool: Pg.Pool
    constructor(pool: Pg.Pool)
  }

  export type RepositoryClass = new(...args: Array<any>) => Repository

  export interface QueryProperties {
    type: 'query'
    sql?: string
    filter?: (r: Pg.QueryResult) => any
    fn?: (...args: Array<any>) => any
  }

  export interface TransactionProperties {
    type: 'transcation'
    sql?: Array<string>
    filter?: (r: ReadonlyArray<Pg.QueryResult>) => any
    fn?: (...args: Array<any>) => any
  }

  export class PgTemplateContainer extends Map<RepositoryClass, Map<PropertyKey, QueryProperties | TransactionProperties>> {
    public static readonly instance: PgTemplateContainer
    public transform(): void
    public untransform(): void
  }

  export function Query(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function QueryFilter<T>(filter: (r: Pg.QueryResult) => T): (target: Repository, propertyKey: PropertyKey) => void
  export function Transaction(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function TransactionFilter<T>(filter: (r: ReadonlyArray<Pg.QueryResult>) => T): (target: Repository, propertyKey: PropertyKey) => void
}

export = WebNode
