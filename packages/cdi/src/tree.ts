export class TreeNode<T> {
  private parent?: TreeNode<T>
  private children?: Set<TreeNode<T>>
  public  value: T

  public setParent(parent: TreeNode<T>) {
    this.parent = parent
  }

  public getParent(): TreeNode<T> {
    return this.parent
  }

  public deleteParent() {
    Reflect.deleteProperty(this, 'parent')
  }

  public hasParent(): boolean {
    return this.parent instanceof TreeNode
  }

  public addChild(child?: TreeNode<T>): TreeNode<T> {
    if (this.children === undefined) {
      this.children = new Set()
    }
    if (child === undefined) {
      child = new TreeNode()
    }
    child.parent = this
    this.children.add(child)
    return child
  }

  public deleteChild(child: TreeNode<T>) {
    this.children !== undefined && this.children.delete(child)
  }

  public hasChild(child: TreeNode<T>): boolean {
    return this.children !== undefined && this.children.has(child)
  }

  public * valuesOfChildren(): Iterable<TreeNode<T>> {
    if (this.children !== undefined) {
      for (let child of this.children) {
        yield child
      }
    }
  }

  public * values(): Iterable<T> {
    if (this.children !== undefined) {
      for (let child of this.children) {
        yield child.value
      }
    }
  }

  public sizeOfChildren(): number {
    return this.children === undefined ? 0 : this.children.size
  }

  public clearChildren() {
    this.children !== undefined && this.children.clear()
  }
}

