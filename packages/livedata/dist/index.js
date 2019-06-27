"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class LiveData {
    constructor() {
        this.handlers = new Map();
    }
    observe(com, cb) {
        if (this.handlers.has(com)) {
            let handler = this.handlers.get(com);
            if (handler.callback instanceof Array) {
                handler.callback.push(cb);
            }
            else {
                handler.callback = [handler.callback, cb];
            }
        }
        else {
            let canceler = () => this.handlers.delete(com);
            this.handlers.set(com, {
                callback: cb,
                canceler: canceler
            });
            com.addLiveCanceler(canceler);
        }
    }
    set(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve();
            this._value = value;
            for (let handler of this.handlers.values()) {
                if (handler.callback instanceof Array) {
                    for (let cb of handler.callback) {
                        cb(this._value);
                    }
                }
                else {
                    handler.callback(this._value);
                }
            }
        });
    }
    get value() {
        return this._value;
    }
    hasObservers() {
        return this.handlers.size > 0;
    }
    sizeOfObservers() {
        return this.handlers.size;
    }
    hasObserver(com) {
        return this.handlers.has(com);
    }
    deleteObserver(com) {
        com.deleteLiveCanceler(this.handlers.get(com).canceler);
        this.handlers.delete(com);
    }
    deleteObserverIfHas(com) {
        if (this.handlers.has(com)) {
            com.deleteLiveCanceler(this.handlers.get(com).canceler);
            this.handlers.delete(com);
        }
    }
    clearObservers() {
        this.handlers.clear();
    }
}
exports.LiveData = LiveData;

//# sourceMappingURL=index.js.map
