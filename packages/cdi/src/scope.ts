/*
  这个模块说明节点可以拥有的作用域，请注意，框架不提供 Dependent 作用域。对于 Java EE CDI
  Dependent Scope，本框架认为这种依赖父级作用域的场景，用户应该自己配置构建过程。这样能有效
  防止出现臃肿难以预测的代码。
*/

export enum Scope {
  APPLICATION, SESSION, REQUEST
}

export type SessionIdentifier = symbol
export type RequestIdentifier = symbol