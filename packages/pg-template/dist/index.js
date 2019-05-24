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
const PostgresFormat = require("pg-format");
class PgTemplateContainer extends Map {
    static get instance() {
        if (PgTemplateContainer.sInstance === undefined) {
            PgTemplateContainer.sInstance = new PgTemplateContainer();
        }
        return PgTemplateContainer.sInstance;
    }
    transform() {
        for (let [classType, map] of super.entries()) {
            for (let [key, value] of map.entries()) {
                if (typeof value.sql === 'string' && value.transformed !== true) {
                    value.transformed = true;
                    switch (value.type) {
                        case 'Query':
                            value.fn = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let result = yield this.pool.query(PostgresFormat.withArray(value.sql, args));
                                        return typeof value.filter === 'function' ? value.filter(result) : result;
                                    });
                                }
                            });
                            break;
                        case 'PureQuery':
                            value.fn = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return function (c) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            let result = yield c.query(PostgresFormat.withArray(value.sql, args));
                                            return typeof value.filter === 'function' ? value.filter(result) : result;
                                        });
                                    };
                                }
                            });
                            break;
                        case 'TransactionQuery':
                            value.fn = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let connection = yield this.pool.connect();
                                        let result;
                                        let returnValue;
                                        try {
                                            yield connection.query('BEGIN');
                                            result = yield connection.query(PostgresFormat.withArray(value.sql, args));
                                            yield connection.query('COMMIT');
                                            if (typeof value.guard === 'function') {
                                                if (!value.guard(result)) {
                                                    throw new Error(`Incorrect transaction: ${typeof value.guardMessage === 'string' ? value.guardMessage : ''}`);
                                                }
                                            }
                                        }
                                        catch (e) {
                                            yield connection.query('ROLLBACK');
                                            throw e;
                                        }
                                        finally {
                                            connection.release();
                                        }
                                        return typeof value.filter === 'function' ? value.filter(result) : result;
                                    });
                                }
                            });
                            break;
                    }
                }
            }
        }
    }
    untransform() {
        for (let [classType, map] of super.entries()) {
            for (let [key, value] of map.entries()) {
                if (typeof value.sql === 'string' && value.transformed === true) {
                    value.transformed = false;
                    switch (value.type) {
                        case 'Query':
                        case 'PureQuery':
                        case 'TransactionQuery':
                            Reflect.defineProperty(classType.prototype, key, {
                                value: value.fn
                            });
                            break;
                    }
                }
            }
        }
    }
}
exports.PgTemplateContainer = PgTemplateContainer;
function Query(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        let c = PgTemplateContainer.instance.get(classType);
        if (!c.has(propertyKey)) {
            c.set(propertyKey, Object.create(null));
        }
        c.get(propertyKey).type = 'Query';
        c.get(propertyKey).sql = sql;
    };
}
exports.Query = Query;
function PureQuery(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        let c = PgTemplateContainer.instance.get(classType);
        if (!c.has(propertyKey)) {
            c.set(propertyKey, Object.create(null));
        }
        c.get(propertyKey).type = 'PureQuery';
        c.get(propertyKey).sql = sql;
    };
}
exports.PureQuery = PureQuery;
function TransactionQuery(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        let c = PgTemplateContainer.instance.get(classType);
        if (!c.has(propertyKey)) {
            c.set(propertyKey, Object.create(null));
        }
        c.get(propertyKey).type = 'TransactionQuery';
        c.get(propertyKey).sql = sql;
    };
}
exports.TransactionQuery = TransactionQuery;
function TransactionGuard(guard, message) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        let c = PgTemplateContainer.instance.get(classType);
        if (!c.has(propertyKey)) {
            c.set(propertyKey, Object.create(null));
        }
        c.get(propertyKey).guard = guard;
        c.get(propertyKey).guardMessage = message;
    };
}
exports.TransactionGuard = TransactionGuard;
function QueryFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        let c = PgTemplateContainer.instance.get(classType);
        if (!c.has(propertyKey)) {
            c.set(propertyKey, Object.create(null));
        }
        c.get(propertyKey).filter = filter;
    };
}
exports.QueryFilter = QueryFilter;

//# sourceMappingURL=index.js.map
