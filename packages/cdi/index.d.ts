declare namespace WebNode {
  export type ClassType<T=any> = new(...args: any[]) => T
  export type ClassTypeDecorator<T=any> = (target: ClassType<T>) => ClassType<T>

  export enum Scope {
    APPLICATION, SESSION, REQUEST
  }

  export type SessionIdentifier = symbol
  export type RequestIdentifier = symbol

  export type Provider = () => ProviderInstance | Promise<ProviderInstance>
  export type ProviderInstance = NonNullable<Object>
  export type ProviderKey = PropertyKey
  export type ProviderMap = Map<ProviderKey, Provider>
  export type ProviderInstanceContainer = Map<ProviderKey, ProviderInstance>

  export class ProviderContainer {
    public static readonly instance: ProviderContainer

    public set(scope: Scope, key: ProviderKey, provider: Provider): void
    public has(scope: Scope, key: ProviderKey): boolean
    public get(scope: Scope, key: ProviderKey): Provider
    public delete(scope: Scope, key: ProviderKey): void
    public clear(): void
    public entries(scope: Scope): Iterable<[ProviderKey, Provider]>
  }

  export type Node<T=any> = ClassType<T>  
  export type NodeInstance<T extends Node =any> = InstanceType<T> & NonNullable<Object>

  export class NodeInstanceContainer<T extends Node=any> {
    public add(node: Node<T>, instance: NodeInstance<T>): this
    public get(node: Node<T>): NodeInstance<T> | Set<NodeInstance<T>>
    public has(node: Node<T>): boolean
    public delete(node: Node<T>): void
    public clear(): void
    public values(): Iterable<NodeInstance<T>>
    public entries(): Iterable<[Node<T>, NodeInstance<T>]>
  }

  export interface Dependency {
    providerKey: ProviderKey
    providerType: ClassType
    scope: Scope
    parameterIndex: number
  }

  export class DependencyContainer {
    public static readonly instance: DependencyContainer

    public set<T>(node: Node<T>, propertyKey: PropertyKey, parameterIndex: number, providerKey: ProviderKey, scope: Scope) : void
    public get<T>(node: Node<T>, propertyKey: PropertyKey): Array<Dependency>
    public delete<T>(node: Node<T>, propertyKey?: PropertyKey): void
    public valuesOfDependencies<T>(node: Node<T>, propertyKey: PropertyKey): Iterable<Dependency>
    public entriesOfDependencies<T>(): Iterable<[Node, PropertyKey, Dependency]>
  }

  export class Context {
    public readonly providerInstanceContainer: ProviderInstanceContainer
    public readonly nodeInstanceContainer: NodeInstanceContainer
  }

  export class RequestContext extends Context {}
  export class SessionContext extends Context {
    public readonly requests: Map<RequestIdentifier, RequestContext>
  }

  export class ApplicationContext extends Context {
    public static readonly instance: ApplicationContext

    public createSessionContext(session: SessionIdentifier): void
    public createRequestContext(session: SessionIdentifier, request: RequestIdentifier): void
    public clearApplicationContext(): void
    public deleteSessionContext(session: SessionIdentifier): void
    public deleteRequestContext(session: SessionIdentifier, request: RequestIdentifier): void
    public hasSessionContext(session: SessionIdentifier): boolean
    public hasRequestContext(session: SessionIdentifier, request: RequestIdentifier): boolean
    public getProviderInstanceContainerOfApplicationLocal(): ProviderInstanceContainer
    public getNodeInstanceContainerOfApplicationLocal(): NodeInstanceContainer
    public getProviderInstanceContainerOfSessionLocal(session: SessionIdentifier): ProviderInstanceContainer
    public getNodeInstanceContainerOfSessionLocal(session: SessionIdentifier): NodeInstanceContainer
    public getProviderInstanceContainerOfRequestLocal(session: SessionIdentifier, request: RequestIdentifier): ProviderInstanceContainer
    public getNodeInstanceContainerOfRequestLocal(session: SessionIdentifier, request: RequestIdentifier): NodeInstanceContainer
    public providerInstancesOfApplicationContext(): Iterable<ProviderInstance>
    public nodeInstancesOfApplicationContext(): Iterable<ProviderInstance>
    public providerInstancesOfSessionContext(session: SessionIdentifier): Iterable<ProviderInstance>
    public nodeInstancesOfSessionContext(session: SessionIdentifier): Iterable<NodeInstance>
    public providerInstancesOfRequestContext(session: SessionIdentifier, request: RequestIdentifier): Iterable<ProviderInstance>
    public nodeInstancesOfRequestContext(session: SessionIdentifier, request: RequestIdentifier): Iterable<NodeInstance>
  }

  export class NodeDispatcher {
    public static create(
      providerContainer: ProviderContainer, 
      dependencyContainer: DependencyContainer,
      context: ApplicationContext
    ): NodeDispatcher

    constructor(providerContainer: ProviderContainer, dependencyContainer: DependencyContainer, context: ApplicationContext)
    public check(): void
    public genArgumentsOnApplicationLocal<T>(node: Node<T>, propertyKey: PropertyKey): Array<any>
    public genArgumentsOnSessionLocal<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionIdentifier): Array<any>
    public genArgumentsOnRequestLocal<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionIdentifier, request: RequestIdentifier): Array<any>
    public applyOnApplicationLocal(instance: NodeInstance, propertyKey: PropertyKey): void
    public applyOnSessionLocal(instance: NodeInstance, propertyKey: PropertyKey, session: SessionIdentifier): void
    public applyOnRequestLocal(instance: NodeInstance, propertyKey: PropertyKey, session: SessionIdentifier, request: RequestIdentifier): void
    public createApplicationContext(): void
    public destroyApplicationContext(): void
    public createInstanceOnApplicationLocal<T>(node: Node<T>): T
    public getInstanceOnApplicationLocal<T>(node: Node<T>): T | Set<T>
    public createSessionContext(): SessionIdentifier
    public destroySessionContext(session: SessionIdentifier): void
    public createInstanceOnSessionLocal<T>(node: Node<T>, session: SessionIdentifier): T
    public getInstanceOnSessionLocal<T>(node: Node<T>, session: SessionIdentifier): T | Set<T>
    public createRequestContext(session: SessionIdentifier): RequestIdentifier
    public destroyRequestContext(session: SessionIdentifier, request: RequestIdentifier): void
    public createInstanceOnRequestLocal<T>(node: Node<T>, session: SessionIdentifier, request: RequestIdentifier): T
    public getInstanceOnRequestLocal<T>(node: Node<T>, session: SessionIdentifier, request: RequestIdentifier): T | Set<T>
  }

  export function ApplicationScope(providerKey: ProviderKey): ParameterDecorator
  export function SessionScope(providerKey: ProviderKey): ParameterDecorator
  export function RequestScope(providerKey: ProviderKey): ParameterDecorator
}

export = WebNode



