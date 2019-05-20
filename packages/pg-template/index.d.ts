
import Pg = require("pg")
import PgFormat = require("pg-format")

declare namespace WebNode {
  export interface Repository {
    readonly pool: Pg.Pool
  }

  export type RepositoryClass = new(...args: Array<any>) => Repository

  export type QueryType = 'Query' | 'PureQuery' | 'MultipleQuery' | 'Transcation'

  export interface QueryProperties {
    type: QueryType
    sql: string
    fn: (...args: Array<any>) => any
    filter: (r: Pg.QueryResult | ReadonlyArray<Pg.QueryResult>) => any
  }

  export class PgTemplateContainer extends Map<RepositoryClass, Map<PropertyKey, QueryProperties>> {
    public static readonly instance: PgTemplateContainer
    public transform(): void
    public untransform(): void
  }

  export function Query(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function PureQuery(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function QueryFilter<T>(filter: (r: Pg.QueryResult) => T): (target: Repository, propertyKey: PropertyKey) => void
  export function MultipleQuery(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function MultipleQueryFilter<T>(filter: (r: ReadonlyArray<Pg.QueryResult>) => T): (target: Repository, propertyKey: PropertyKey) => void
  export function Transaction(sql: string): (target: Repository, propertyKey: PropertyKey) => void
  export function TransactionFilter<T>(filter: (r: ReadonlyArray<Pg.QueryResult>) => T): (target: Repository, propertyKey: PropertyKey) => void
}

export = WebNode
