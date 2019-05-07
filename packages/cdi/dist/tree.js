"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TreeNode {
    setParent(parent) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    deleteParent() {
        Reflect.deleteProperty(this, 'parent');
    }
    hasParent() {
        return this.parent instanceof TreeNode;
    }
    addChild(child) {
        if (this.children === undefined) {
            this.children = new Set();
        }
        if (child === undefined) {
            child = new TreeNode();
        }
        child.parent = this;
        this.children.add(child);
        return child;
    }
    deleteChild(child) {
        this.children !== undefined && this.children.delete(child);
    }
    hasChild(child) {
        return this.children !== undefined && this.children.has(child);
    }
    *valuesOfChildren() {
        if (this.children !== undefined) {
            for (let child of this.children) {
                yield child;
            }
        }
    }
    *values() {
        if (this.children !== undefined) {
            for (let child of this.children) {
                yield child.value;
            }
        }
    }
    sizeOfChildren() {
        return this.children === undefined ? 0 : this.children.size;
    }
    clearChildren() {
        this.children !== undefined && this.children.clear();
    }
}
exports.TreeNode = TreeNode;

//# sourceMappingURL=tree.js.map
