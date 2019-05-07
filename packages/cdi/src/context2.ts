import {Scope, SessionIdentifier, RequestIdentifier} from './scope'
import {Provider, ProviderInstance, ProviderKey, ProviderInstanceContainer} from './provider'
import {Node, NodeInstance, NodeInstanceContainer} from './node'
import {TreeNode} from './tree'

export interface Value {
  providerContainer: ProviderInstanceContainer
  nodeContainer: NodeInstanceContainer
}

export type ApplicationContext = TreeNode<Value>
export type SessionContext = TreeNode<Value>
export type RequestContext = TreeNode<Value>


