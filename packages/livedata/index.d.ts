declare namespace WebNode {
  export interface LifecycleOwner {
    addLiveCanceler(cb: LiveCanceler): void
    deleteLiveCanceler(cb: LiveCanceler): void
  }

  export interface LiveCanceler {
    (): void
  }

  export interface LiveCallback<T> {
    (value: T): void
  } 

  interface LiveHandler<T> {
    callback: LiveCallback<T> | Array<LiveCallback<T>>
    canceler: LiveCanceler
  }

  export class LiveData<T> {
    public observe(com: LifecycleOwner, cb: LiveCallback<T>): void
    public set(value: T): Promise<void>
    public readonly value: T 
    public hasObservers(): boolean 
    public sizeOfObservers(): number
    public hasObserver(com: LifecycleOwner): void
    public deleteObserver(com: LifecycleOwner): void
    public deleteObserverIfHas(com: LifecycleOwner): void
    public clearObservers(): void
  }
}

export = WebNode
