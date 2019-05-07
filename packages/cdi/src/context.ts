import {ProviderInstanceContainer} from './provider'
import {NodeInstanceContainer} from './node'
import {TreeNode} from './tree'

export interface Value {
  providerContainer: ProviderInstanceContainer
  nodeContainer: NodeInstanceContainer
}

export type Context = TreeNode<Value>
export type ApplicationContext = Context
export type SessionContext = Context
export type RequestContext = Context


