import React = require("react")
import Lividata = require("@webnode/livedata")

declare namespace WebNode {
  export interface LifecycleComponent<P = {}, S = {}> extends React.Component<P, S>, Lividata.LifecycleOwner {
  }

  export abstract class LiveComponent<P = {}, S = {}> extends React.Component<P, S> implements LifecycleComponent<P, S> {
    public addLiveCanceler(cb: Lividata.LiveCanceler): void
    public deleteLiveCanceler(cb: Lividata.LiveCanceler): void
    public componentWillUnmount(): void
  }

  export abstract class LivePureComponent<P = {}, S = {}> extends React.PureComponent<P, S> implements LifecycleComponent<P, S> {
    public addLiveCanceler(cb: Lividata.LiveCanceler): void
    public deleteLiveCanceler(cb: Lividata.LiveCanceler): void
    public componentWillUnmount(): void
  }
}

export = WebNode
