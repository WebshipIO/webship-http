"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class LiveComponent extends react_1.Component {
    constructor() {
        super(...arguments);
        this.cancelers = new Set();
    }
    addLiveCanceler(cb) {
        this.cancelers.add(cb);
    }
    deleteLiveCanceler(cb) {
        this.cancelers.delete(cb);
    }
    componentWillUnmount() {
        for (let cb of this.cancelers.values()) {
            cb();
        }
    }
}
exports.LiveComponent = LiveComponent;
class LivePureComponent extends react_1.PureComponent {
    constructor() {
        super(...arguments);
        this.cancelers = new Set();
    }
    addLiveCanceler(cb) {
        this.cancelers.add(cb);
    }
    deleteLiveCanceler(cb) {
        this.cancelers.delete(cb);
    }
    componentWillUnmount() {
        for (let cb of this.cancelers.values()) {
            cb();
        }
    }
}
exports.LivePureComponent = LivePureComponent;

//# sourceMappingURL=index.js.map
