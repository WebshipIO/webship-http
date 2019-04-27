import {Scope} from './scope'
import {DependencyContainer} from './dependency'
import {ProviderKey} from './provider'
import {Node} from './node'

function BaseScope(scope: Scope, providerKey: ProviderKey): ParameterDecorator {
  return (target: Object, propertyKey: PropertyKey, parameterIndex: number) => {
    if (target.constructor === Function) {
      DependencyContainer.instance.set(target as Node, 'constructor', parameterIndex, providerKey, scope)
    } else {
      DependencyContainer.instance.set(target.constructor as Node, propertyKey, parameterIndex, providerKey, scope)
    }
  }
}

export function ApplicationScope(providerKey: ProviderKey): ParameterDecorator {
  return BaseScope(Scope.APPLICATION, providerKey)
}

export function SessionScope(providerKey: ProviderKey): ParameterDecorator {
  return BaseScope(Scope.SESSION, providerKey)
}

export function RequestScope(providerKey: ProviderKey): ParameterDecorator {
  return BaseScope(Scope.REQUEST, providerKey)
}