
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
  private _value: T
  private handlers: Map<LifecycleOwner, LiveHandler<T>> = new Map()

  public observe(com: LifecycleOwner, cb: LiveCallback<T>) {
    if (this.handlers.has(com)) {
      let handler = this.handlers.get(com)
      if (handler.callback instanceof Array) {
        handler.callback.push(cb)
      } else {
        handler.callback = [handler.callback, cb]
      }
    } else {
      let canceler = () => this.handlers.delete(com)
      this.handlers.set(com, {
        callback: cb,
        canceler: canceler
      })
      com.addLiveCanceler(canceler)
    }
  }

  public set(value: T) {
    this._value = value
    for (let handler of this.handlers.values()) {
      if (handler.callback instanceof Array) {
        for (let cb of handler.callback) {
          cb(this._value)
        }
      } else {
        handler.callback(this._value)
      }
    }
  }

  public get value(): T {
    return this._value
  }

  public hasObservers(): boolean {
    return this.handlers.size > 0
  }

  public sizeOfObservers(): number {
    return this.handlers.size
  }

  public hasObserver(com: LifecycleOwner) {
    return this.handlers.has(com)
  }

  public deleteObserver(com: LifecycleOwner) {
    com.deleteLiveCanceler(this.handlers.get(com).canceler)
    this.handlers.delete(com)
  }

  public deleteObserverIfHas(com: LifecycleOwner) {
    if (this.handlers.has(com)) {
      com.deleteLiveCanceler(this.handlers.get(com).canceler)
      this.handlers.delete(com)
    }
  }

  public clearObservers() {
    this.handlers.clear()
  }
}
