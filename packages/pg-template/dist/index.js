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
                if (typeof value.sql === 'string') {
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
                        case 'MultipleQuery':
                            value.fn = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let connection = yield this.pool.connect();
                                        let result = [];
                                        let sqls = PostgresFormat.withArray(value.sql, args).split(';').filter(x => x.trim().length > 0);
                                        try {
                                            for (let s of sqls) {
                                                let a = yield connection.query(s);
                                                result.push(a);
                                            }
                                        }
                                        catch (e) {
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
                        case 'Transcation':
                            value.fn = Reflect.get(classType.prototype, key);
                            Reflect.defineProperty(classType.prototype, key, {
                                value: function (...args) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        let connection = yield this.pool.connect();
                                        let result = [];
                                        let sqls = PostgresFormat.withArray(value.sql, args).split(';').filter(x => x.trim().length > 0);
                                        try {
                                            yield connection.query('BEGIN');
                                            for (let s of sqls) {
                                                let a = yield connection.query(s);
                                                result.push(a);
                                            }
                                            yield connection.query('COMMIT');
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
                if (typeof value.sql === 'string') {
                    switch (value.type) {
                        case 'Query':
                        case 'PureQuery':
                        case 'MultipleQuery':
                        case 'Transcation':
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
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'Query',
                sql: sql,
                fn: null,
                filter: null
            });
        }
        else {
            PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.Query = Query;
function PureQuery(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'PureQuery',
                sql: sql,
                fn: null,
                filter: null
            });
        }
        else {
            PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.PureQuery = PureQuery;
function QueryFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'Query',
                sql: null,
                fn: null,
                filter: filter
            });
        }
        else {
            PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter;
        }
    };
}
exports.QueryFilter = QueryFilter;
function MultipleQuery(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'MultipleQuery',
                sql: sql,
                fn: null,
                filter: null
            });
        }
        else {
            PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.MultipleQuery = MultipleQuery;
function MultipleQueryFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'MultipleQuery',
                sql: null,
                fn: null,
                filter: filter
            });
        }
        PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter;
    };
}
exports.MultipleQueryFilter = MultipleQueryFilter;
function Transaction(sql) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'Transcation',
                sql: sql,
                fn: null,
                filter: null
            });
        }
        else {
            PgTemplateContainer.instance.get(classType).get(propertyKey).sql = sql;
        }
    };
}
exports.Transaction = Transaction;
function TransactionFilter(filter) {
    return function (target, propertyKey) {
        let classType = target.constructor;
        if (!PgTemplateContainer.instance.has(classType)) {
            PgTemplateContainer.instance.set(classType, new Map());
        }
        if (!PgTemplateContainer.instance.get(classType).has(propertyKey)) {
            PgTemplateContainer.instance.get(classType).set(propertyKey, {
                type: 'Transcation',
                sql: null,
                fn: null,
                filter: filter
            });
        }
        PgTemplateContainer.instance.get(classType).get(propertyKey).filter = filter;
    };
}
exports.TransactionFilter = TransactionFilter;

//# sourceMappingURL=index.js.map
