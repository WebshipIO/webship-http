declare namespace WebNode {
  export type ClassType<T=any> = new(...args: any[]) => T
  export type ClassTypeDecorator<T=any> = (target: ClassType<T>) => ClassType<T>

  export enum Scope {
    APPLICATION, SESSION, REQUEST
  }

  export type Provider = (application: ApplicationContext, session?: SessionContext, request?: RequestContext) => ProviderInstance | Promise<ProviderInstance>
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
    public size(scope: Scope): number
    public values(scope: Scope): Iterable<Provider>
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
    public size(): number
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
    public clear(): void
    public size<T>(node?: Node<T>): number
    public values<T>(node: Node<T>, propertyKey: PropertyKey): Iterable<Dependency>
    public entries<T>(): Iterable<[Node, PropertyKey, Dependency]>
  }

  export class TreeNode<T> {
    public value: T
    public setParent(parent: TreeNode<T>): void 
    public getParent(): TreeNode<T>
    public deleteParent(): void  
    public hasParent(): boolean
    public addChild(child?: TreeNode<T>): TreeNode<T>
    public deleteChild(child: TreeNode<T>): void
    public hasChild(child: TreeNode<T>): boolean
    public valuesOfChildren(): Iterable<TreeNode<T>>
    public values(): Iterable<T>
    public sizeOfChildren(): number
    public clearChildren(): void
  }

  export interface Value {
    providerContainer: ProviderInstanceContainer
    nodeContainer: NodeInstanceContainer
  }

  export type Context = TreeNode<Value>
  export type ApplicationContext = Context
  export type SessionContext = Context
  export type RequestContext = Context

  export class NodeDispatcher {
    public static create(providerContainer: ProviderContainer, dependencyContainer: DependencyContainer): NodeDispatcher

    constructor(providerContainer: ProviderContainer, dependencyContainer: DependencyContainer)
    public check(): void
    public createApplicationContext(): Promise<ApplicationContext>
    public createNodeOfApplicationContext<T>(node: Node<T>): Promise<T>
    public destroyApplicationContext(): Promise<void>
    public createSessionContext(): Promise<SessionContext>
    public createNodeOfSessionContext<T>(node: Node<T>, session: SessionContext): Promise<T>
    public destroySessionContext(session: SessionContext): Promise<void>
    public createRequestContext(session: SessionContext): Promise<RequestContext>
    public createNodeOfRequestContext<T>(node: Node<T>, request: RequestContext): Promise<T>
    public destroyRequestContext(request: RequestContext): Promise<void>
    public genArgumentsOfApplicationContext<T>(node: Node<T>, propertyKey: PropertyKey): Array<any>
    public genArgumentsOfSessionContext<T>(node: Node<T>, propertyKey: PropertyKey, session: SessionContext): Array<any>
    public genArgumentsOfRequestContext<T>(node: Node<T>, propertyKey: PropertyKey, request: RequestContext): Array<any>
    public applyOfApplicationContext(instance: NodeInstance, propertyKey: PropertyKey): any
    public applyOfSessionContext(instance: NodeInstance, propertyKey: PropertyKey, session: SessionContext): any
    public applyOfRequestContext(instance: NodeInstance, propertyKey: PropertyKey, request: RequestContext): any
  }

  export function ApplicationScope(providerKey: ProviderKey): ParameterDecorator
  export function SessionScope(providerKey: ProviderKey): ParameterDecorator
  export function RequestScope(providerKey: ProviderKey): ParameterDecorator
}

export = WebNode



